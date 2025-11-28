import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeGenerator = ({ requestData }) => {
  const [language, setLanguage] = useState('javascript')
  const [variant, setVariant] = useState('fetch')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [supportedLanguages, setSupportedLanguages] = useState({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadSupportedLanguages()
  }, [])

  useEffect(() => {
    if (requestData && Object.keys(supportedLanguages).length > 0) {
      generateCode()
    }
  }, [language, variant, requestData, supportedLanguages])

  const loadSupportedLanguages = async () => {
    try {
      const response = await fetch('/docs/api/supported-languages')
      const data = await response.json()
      setSupportedLanguages(data)
      // Set default variant for selected language
      if (data.javascript?.variants?.length > 0) {
        setVariant(data.javascript.variants[0])
      }
    } catch (err) {
      console.error('Failed to load supported languages:', err)
    }
  }

  const generateCode = async () => {
    if (!requestData || !requestData.url) {
      setCode('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/docs/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          variant,
          request_data: requestData
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setCode('')
      } else {
        setCode(data.code || '')
      }
    } catch (err) {
      setError('Failed to generate code. Please try again.')
      setCode('')
      console.error('Code generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getLanguageForSyntaxHighlighter = () => {
    const langMap = {
      javascript: 'javascript',
      python: 'python',
      ruby: 'ruby',
      php: 'php',
      go: 'go',
      java: 'java',
      csharp: 'csharp',
      swift: 'swift',
      kotlin: 'kotlin'
    }
    return langMap[language] || 'javascript'
  }

  const currentLanguageInfo = supportedLanguages[language] || {}
  const variants = currentLanguageInfo.variants || []

  return (
    <div className="code-generator">
      <div className="mb-2 p-2 bg-green-100 border border-green-500">
        <p className="text-xs font-bold text-black">✅ CodeGenerator Component Rendered</p>
        <p className="text-xs text-black">URL: {requestData?.url || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value)
              const newVariants = supportedLanguages[e.target.value]?.variants || []
              if (newVariants.length > 0 && !newVariants.includes(variant)) {
                setVariant(newVariants[0])
              }
            }}
            className="input-field flex-1 text-sm bg-white border-black text-black font-bold"
          >
            {Object.entries(supportedLanguages).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name}
              </option>
            ))}
          </select>
          {variants.length > 1 && (
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="input-field flex-1 text-sm bg-white border-black text-black font-bold"
            >
              {variants.map(v => (
                <option key={v} value={v}>
                  {v === 'fetch' ? 'Fetch API' :
                   v === 'axios' ? 'Axios' :
                   v === 'requests' ? 'Requests' :
                   v === 'httpx' ? 'HTTPX' :
                   v === 'net_http' ? 'Net::HTTP' :
                   v === 'httparty' ? 'HTTParty' :
                   v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-black/60 font-medium mb-2">Generating code...</div>
      )}

      {error && (
        <div className="mb-3 surface border-2 border-red-500 bg-red-50 text-red-900 text-sm p-3 font-bold">
          {error}
        </div>
      )}

      {code && !loading && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-black/60 font-bold">
              {currentLanguageInfo.name} Code
            </p>
            <button
              onClick={copyToClipboard}
              className="text-xs btn-secondary px-2 py-1"
              title="Copy code"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div className="rounded-none border-2 border-black bg-white">
            <SyntaxHighlighter
              language={getLanguageForSyntaxHighlighter()}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '16px',
                fontSize: '14px',
                backgroundColor: '#fff',
                border: 'none'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {!code && !loading && !error && requestData && requestData.url && (
        <div className="text-sm text-black/60 font-medium">
          Select an endpoint and configure your request to generate code.
        </div>
      )}
    </div>
  )
}

export default CodeGenerator

