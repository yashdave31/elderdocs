import React, { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const ApiExplorer = ({ data, selectedItem }) => {
  const { authConfig, setAuthConfig } = useApiKey()
  const [params, setParams] = useState({})
  const [headers, setHeaders] = useState({})
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showCurlPreview, setShowCurlPreview] = useState(false)
  
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

  const generateCurl = () => {
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
    
    return curlParts.join(' \\\n  ')
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

        <div className="reveal" style={{ animationDelay: '300ms' }}>
          <button
            onClick={() => setShowCurlPreview(!showCurlPreview)}
            className="btn-secondary w-full mb-3 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>💻</span>
              <span>{showCurlPreview ? 'Hide' : 'Show'} cURL Command</span>
            </span>
            <span>{showCurlPreview ? '▲' : '▼'}</span>
          </button>
          
          {showCurlPreview && (
            <div className="mb-3 surface border-2 border-black bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 font-bold">cURL Command</p>
                <button
                  onClick={copyCurl}
                  className="text-xs btn-secondary px-2 py-1"
                  title="Copy cURL command"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono text-black overflow-x-auto whitespace-pre-wrap break-words">
                {generateCurl()}
              </pre>
            </div>
          )}
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
