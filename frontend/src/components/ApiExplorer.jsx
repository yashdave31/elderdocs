import React, { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import CodeGenerator from './features/CodeGenerator'
import TestCodeGenerator from './features/TestCodeGenerator'

const ApiExplorer = ({ data, selectedItem }) => {
  const { authConfig, setAuthConfig } = useApiKey()
  const [params, setParams] = useState({})
  const [headers, setHeaders] = useState({})
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showCurlPreview, setShowCurlPreview] = useState(true)
  const [curlFormat, setCurlFormat] = useState('multiline') // 'multiline' | 'single' | 'escaped' | 'powershell'
  
  const authTypes = data?.auth_types || ['bearer', 'api_key', 'basic', 'oauth2']
  const currentAuthType = authConfig?.type || 'bearer'
  const isEndpoint = selectedItem && selectedItem.type === 'endpoint'
  const selectedPath = isEndpoint ? selectedItem.path : ''
  const selectedMethod = isEndpoint ? selectedItem.method : ''
  const operation = isEndpoint ? data.openapi.paths[selectedPath]?.[selectedMethod] : null
  const servers = data.api_servers?.length > 0 ? data.api_servers : (data.openapi.servers || [])
  const defaultServerUrl = data.api_server || servers[0]?.url || ''
  const [selectedServer, setSelectedServer] = useState(defaultServerUrl)
  const [isCustomUrl, setIsCustomUrl] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const fullUrl = `${isCustomUrl ? customUrl : selectedServer}${selectedPath}`

  if (!isEndpoint) {
    return (
      <div className={`w-[360px] surface border-l-0 border-black/10 flex flex-col transition-all bg-white ${isOpen ? '' : 'hidden'}`} style={{ borderLeftWidth: '3px' }}>
        <div className="p-6 border-b-0 border-black/10" style={{ borderBottomWidth: '3px' }}>
          <div className="pill text-black bg-yellow-400 border-black mb-4">API Explorer</div>
          <div className="text-base font-bold text-black">Select an endpoint to light up the live runner.</div>
        </div>
      </div>
    )
  }

  if (!operation) return null

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const handleHeaderChange = (name, value) => {
    setHeaders(prev => ({ ...prev, [name]: value }))
  }

  const handleAuthChange = (type, value) => {
    setAuthConfig({ type, value })
  }

  const buildUrl = () => {
    let url = fullUrl
    const queryParams = []
    
    // First, replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        const param = operation.parameters?.find(p => p.name === key && p.in === 'path')
        if (param) {
          url = url.replace(`{${key}}`, encodeURIComponent(value))
        }
      }
    })
    
    // Then, add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        const param = operation.parameters?.find(p => p.name === key && p.in === 'query')
        if (param) {
          queryParams.push(`${key}=${encodeURIComponent(value)}`)
        }
      }
    })
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&')
    }
    
    return url
  }

  const generateCurl = (format = curlFormat) => {
    const url = buildUrl()
    const method = selectedMethod.toUpperCase()
    const curlParts = [`curl -X ${method}`]
    
    // Add URL
    curlParts.push(`"${url}"`)
    
    // Add headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    }
    
    // Apply authentication based on type
    if (authConfig?.value) {
      switch (authConfig.type) {
        case 'bearer':
          requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
          break
        case 'api_key':
          requestHeaders['X-API-Key'] = authConfig.value
          break
        case 'basic':
          requestHeaders['Authorization'] = `Basic ${btoa(authConfig.value)}`
          break
        case 'oauth2':
          requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
          break
      }
    }
    
    // Add all headers to curl command
    Object.entries(requestHeaders).forEach(([key, value]) => {
      curlParts.push(`-H "${key}: ${value}"`)
    })
    
    // Add request body if present
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      try {
        // Validate and format JSON
        const jsonBody = JSON.parse(body)
        const formattedBody = JSON.stringify(jsonBody)
        curlParts.push(`-d '${formattedBody}'`)
      } catch {
        // If not valid JSON, add as-is
        curlParts.push(`-d '${body}'`)
      }
    }
    
    // Format based on selected format
    switch (format) {
      case 'single':
        return curlParts.join(' ')
      case 'escaped':
        return curlParts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(' ')
      case 'powershell':
        return generatePowerShellCommand(url, method, requestHeaders, body)
      default: // 'multiline'
        return curlParts.join(' \\\n  ')
    }
  }

  const generatePowerShellCommand = (url, method, requestHeaders, body) => {
    const headersObj = Object.entries(requestHeaders)
      .map(([key, value]) => `  '${key}' = '${value.replace(/'/g, "''")}'`)
      .join('\n')
    
    let psCommand = `$headers = @{\n${headersObj}\n}\n\n`
    
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      try {
        const jsonBody = JSON.parse(body)
        const formattedBody = JSON.stringify(jsonBody).replace(/'/g, "''")
        psCommand += `$body = '${formattedBody}'\n\n`
        psCommand += `Invoke-WebRequest -Uri '${url}' -Method ${method} -Headers $headers -Body $body -ContentType 'application/json'`
      } catch {
        psCommand += `$body = '${body.replace(/'/g, "''")}'\n\n`
        psCommand += `Invoke-WebRequest -Uri '${url}' -Method ${method} -Headers $headers -Body $body -ContentType 'application/json'`
      }
    } else {
      psCommand += `Invoke-WebRequest -Uri '${url}' -Method ${method} -Headers $headers`
    }
    
    return psCommand
  }

  const downloadCurl = (format) => {
    const curlCommand = generateCurl(format)
    const extension = format === 'powershell' ? 'ps1' : 'sh'
    const mimeType = format === 'powershell' ? 'text/plain' : 'text/x-sh'
    const blob = new Blob([curlCommand], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-request.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyCurl = async () => {
    try {
      const curlCommand = generateCurl()
      await navigator.clipboard.writeText(curlCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generateCurl()
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  const executeRequest = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const url = buildUrl()
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
      }

      // Apply authentication based on type
      if (authConfig?.value) {
        switch (authConfig.type) {
          case 'bearer':
            requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
            break
          case 'api_key':
            requestHeaders['X-API-Key'] = authConfig.value
            break
          case 'basic':
            requestHeaders['Authorization'] = `Basic ${btoa(authConfig.value)}`
            break
          case 'oauth2':
            requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
            break
        }
      }

      const requestOptions = {
        method: selectedMethod.toUpperCase(),
        headers: requestHeaders
      }

      if (['post', 'put', 'patch'].includes(selectedMethod.toLowerCase()) && body) {
        requestOptions.body = body
      }

      const startTime = Date.now()
      const res = await fetch(url, requestOptions)
      const endTime = Date.now()

      const responseText = await res.text()
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseData,
        time: endTime - startTime,
        url: url
      })
    } catch (error) {
      setResponse({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const queryParams = operation.parameters?.filter(p => p.in === 'query') || []
  const pathParams = operation.parameters?.filter(p => p.in === 'path') || []
  const headerParams = operation.parameters?.filter(p => p.in === 'header') || []
  const hasRequestBody = operation.requestBody && ['post', 'put', 'patch'].includes(selectedMethod.toLowerCase())

  return (
    <div className={`w-[360px] surface border-l-0 border-black/10 flex flex-col transition-all bg-white ${isOpen ? '' : 'hidden'}`} style={{ borderLeftWidth: '3px' }}>
      <div className="p-6 border-b-0 border-black/10 flex items-center justify-between" style={{ borderBottomWidth: '3px' }}>
        <div>
          <div className="pill text-black bg-yellow-400 border-black">Live Runner</div>
          <h2 className="text-xl font-black text-black mt-4 font-['Syne'] uppercase">Send real traffic</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden btn-secondary px-3 py-2"
        >
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-black">
        {/* ALWAYS VISIBLE TEST - Should appear even if nothing else does */}
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 99999, backgroundColor: '#ff0000', color: 'white', padding: '20px', border: '5px solid black', fontSize: '20px', fontWeight: 'bold' }}>
          🔴 TEST: ApiExplorer IS RENDERING
        </div>
        
        <div className="reveal" style={{ animationDelay: '140ms' }}>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">Base URL</p>
          {!isCustomUrl ? (
            <select
              value={selectedServer}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomUrl(true)
                  setCustomUrl(selectedServer)
                } else {
                  setSelectedServer(e.target.value)
                }
              }}
              className="input-field w-full text-sm bg-white border-black text-black font-bold"
            >
              {servers.map((server, idx) => (
                <option key={idx} value={server.url}>
                  {server.description ? `${server.description} (${server.url})` : server.url}
                </option>
              ))}
              <option value="__custom__">➕ Custom URL...</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Enter custom base URL"
                className="input-field w-full text-sm bg-white border-black text-black font-medium"
              />
              <button
                onClick={() => {
                  setIsCustomUrl(false)
                  if (customUrl && servers.some(s => s.url === customUrl)) {
                    setSelectedServer(customUrl)
                  }
                }}
                className="btn-secondary text-xs px-3 py-1"
              >
                Use Preset
              </button>
            </div>
          )}
        </div>

        <div className="reveal" style={{ animationDelay: '140ms' }}>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">Authentication</p>
          <select
            value={currentAuthType}
            onChange={(e) => handleAuthChange(e.target.value, authConfig?.value || '')}
            className="input-field w-full text-sm bg-white border-black text-black font-bold"
          >
            {authTypes.map(type => (
              <option key={type} value={type}>
                {type === 'bearer' ? 'Bearer Token' :
                 type === 'api_key' ? 'API Key Header' :
                 type === 'basic' ? 'Basic Auth' :
                 type === 'oauth2' ? 'OAuth 2.0' : type}
              </option>
            ))}
          </select>
          <input
            type={currentAuthType === 'basic' ? 'text' : 'password'}
            value={authConfig?.value || ''}
            onChange={(e) => handleAuthChange(currentAuthType, e.target.value)}
            placeholder={
              currentAuthType === 'bearer' ? 'Enter Bearer token' :
              currentAuthType === 'api_key' ? 'Enter API key' :
              currentAuthType === 'basic' ? 'username:password' :
              currentAuthType === 'oauth2' ? 'Enter OAuth token' : 'Enter credentials'
            }
            className="input-field w-full mt-3 text-sm bg-white border-black text-black font-medium"
          />
        </div>

        {[{ label: 'Path Parameters', items: pathParams, handler: handleParamChange, values: params },
          { label: 'Query Parameters', items: queryParams, handler: handleParamChange, values: params },
          { label: 'Headers', items: headerParams, handler: handleHeaderChange, values: headers },
        ].map((section, idx) => (
          section.items.length > 0 && (
            <div key={section.label} className="reveal" style={{ animationDelay: `${160 + idx * 60}ms` }}>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">{section.label}</p>
              {section.items.map((param) => (
                <div key={param.name} className="mb-3">
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/80 mb-1">
                    {param.name} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={section.values[param.name] || ''}
                    onChange={(e) => section.handler(param.name, e.target.value)}
                    placeholder={param.schema?.default || ''}
                    className="input-field w-full text-sm bg-white border-black text-black font-medium"
                  />
                </div>
              ))}
            </div>
          )
        ))}

        {hasRequestBody && (
          <div className="reveal" style={{ animationDelay: '260ms' }}>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">Request Body</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter JSON body"
              className="input-field w-full h-32 font-mono text-sm bg-white border-black text-black font-medium"
            />
          </div>
        )}

        <div style={{ opacity: 1, visibility: 'visible', display: 'block', marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', border: '4px solid #ffc107' }}>
          <div className="mb-3 p-3 bg-yellow-100 border-2 border-yellow-500" style={{ backgroundColor: '#fef3c7', border: '4px solid #f59e0b', padding: '20px', fontSize: '16px', zIndex: 9999 }}>
            <p className="text-sm font-bold text-black" style={{ fontSize: '18px', fontWeight: 'bold' }}>🔍 DEBUG: Code Generation Section</p>
            <p className="text-xs text-black">URL: {buildUrl() || 'NO URL'}</p>
            <p className="text-xs text-black">Method: {selectedMethod || 'NO METHOD'}</p>
            <p className="text-xs text-black">CodeGenerator imported: {typeof CodeGenerator !== 'undefined' ? 'YES' : 'NO'}</p>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-3 font-bold">Code Generation</p>
          <div className="mb-2 p-2 bg-purple-100 border-2 border-purple-500" style={{ backgroundColor: '#e9d5ff', border: '4px solid #9333ea', padding: '15px' }}>
            <p className="text-xs font-bold text-black">TEST: buildUrl() = {buildUrl() || 'FALSE'}</p>
            <p className="text-xs font-bold text-black">TEST: selectedMethod = {selectedMethod || 'FALSE'}</p>
            <p className="text-xs font-bold text-black">TEST: Condition = {(buildUrl() && selectedMethod) ? 'TRUE' : 'FALSE'}</p>
            <p className="text-xs font-bold text-black">TEST: CodeGenerator type = {typeof CodeGenerator}</p>
          </div>
          {buildUrl() && selectedMethod ? (
            (() => {
              try {
                console.log('Rendering CodeGenerator with:', {
                  url: buildUrl(),
                  method: selectedMethod,
                  CodeGeneratorType: typeof CodeGenerator
                })
                return (
                  <div>
                    <div className="mb-2 p-2 bg-red-100 border-2 border-red-500" style={{ backgroundColor: '#fee2e2', border: '4px solid #ef4444', padding: '15px', opacity: 1, visibility: 'visible' }}>
                      <p className="text-xs font-bold text-black" style={{ fontSize: '16px' }}>✅ About to render CodeGenerator</p>
                    </div>
                    <div style={{ opacity: 1, visibility: 'visible', display: 'block' }}>
                      <TestCodeGenerator
                        requestData={{
                          url: buildUrl(),
                          method: selectedMethod.toUpperCase()
                        }}
                      />
                    </div>
                    <CodeGenerator
                      requestData={{
                        url: buildUrl(),
                        method: selectedMethod.toUpperCase(),
                        headers: (() => {
                          const requestHeaders = {
                            'Content-Type': 'application/json',
                            ...headers
                          }
                          if (authConfig?.value) {
                            switch (authConfig.type) {
                              case 'bearer':
                                requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
                                break
                              case 'api_key':
                                requestHeaders['X-API-Key'] = authConfig.value
                                break
                              case 'basic':
                                requestHeaders['Authorization'] = `Basic ${btoa(authConfig.value)}`
                                break
                              case 'oauth2':
                                requestHeaders['Authorization'] = `Bearer ${authConfig.value}`
                                break
                            }
                          }
                          return requestHeaders
                        })(),
                        body: body || null
                      }}
                    />
                  </div>
                )
              } catch (error) {
                console.error('Error rendering CodeGenerator:', error)
                return (
                  <div className="p-3 bg-red-100 border-2 border-red-500">
                    <p className="text-xs font-bold text-red-900">Error: {error.message}</p>
                    <pre className="text-xs text-red-800 mt-2">{error.stack}</pre>
                  </div>
                )
              }
            })()
          ) : (
            <div className="p-3 bg-gray-100 border border-gray-300">
              <p className="text-xs text-black">Waiting for endpoint selection...</p>
            </div>
          )}
        </div>

        <div className="reveal" style={{ animationDelay: '300ms' }}>
          <div className="mb-3 p-3 bg-blue-100 border-2 border-blue-500">
            <p className="text-sm font-bold text-black">🔍 DEBUG: cURL Command Section</p>
            <p className="text-xs text-black">URL: {buildUrl()}</p>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">cURL Command</p>
          <div className="mb-3 surface border-2 border-black bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 font-bold">cURL Command</p>
              <div className="flex items-center gap-2">
                <select
                  value={curlFormat}
                  onChange={(e) => setCurlFormat(e.target.value)}
                  className="text-xs input-field bg-white border-black text-black font-medium px-2 py-1"
                >
                  <option value="multiline">Multi-line</option>
                  <option value="single">Single-line</option>
                  <option value="escaped">Escaped</option>
                  <option value="powershell">PowerShell</option>
                </select>
                <button
                  onClick={copyCurl}
                  className="text-xs btn-secondary px-2 py-1"
                  title="Copy command"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono text-black overflow-x-auto whitespace-pre-wrap break-words mb-3">
              {generateCurl()}
            </pre>
            <div className="flex gap-2">
              {curlFormat !== 'powershell' && (
                <button
                  onClick={() => downloadCurl('multiline')}
                  className="text-xs btn-secondary px-3 py-1"
                  title="Download as shell script"
                >
                  📥 Download .sh
                </button>
              )}
              {curlFormat === 'powershell' && (
                <button
                  onClick={() => downloadCurl('powershell')}
                  className="text-xs btn-secondary px-3 py-1"
                  title="Download as PowerShell script"
                >
                  📥 Download .ps1
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="reveal space-y-3" style={{ animationDelay: '320ms' }}>
          <button
            onClick={executeRequest}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>

        {response && (
          <div className="reveal" style={{ animationDelay: '320ms' }}>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 mb-2 font-bold">Response</p>
            {response.error ? (
              <div className="surface surface--highlight border-2 border-black bg-red-50 text-red-900 text-sm p-4 font-bold rounded-none">
                {response.error}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-black">
                  <span className="chip bg-white border-black text-black">
                    {response.status} {response.statusText}
                  </span>
                  <span className="font-bold">{response.time} ms</span>
                </div>
                <div className="rounded-none border-2 border-black bg-white">
                  <SyntaxHighlighter language="json" style={oneLight} customStyle={{ margin: 0, padding: '16px', fontSize: '14px', backgroundColor: '#fff' }}>
                    {JSON.stringify(response.body, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiExplorer
