import React, { createContext, useContext, useState, useEffect } from 'react'

const ApiKeyContext = createContext()

export const useApiKey = () => {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider')
  }
  return context
}

export const ApiKeyProvider = ({ children }) => {
  const [authConfig, setAuthConfig] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('elderdocs_auth_config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { type: 'bearer', value: '' }
      }
    }
    return { type: 'bearer', value: '' }
  })

  useEffect(() => {
    // Save to localStorage whenever it changes
    if (authConfig) {
      localStorage.setItem('elderdocs_auth_config', JSON.stringify(authConfig))
    } else {
      localStorage.removeItem('elderdocs_auth_config')
    }
  }, [authConfig])

  return (
    <ApiKeyContext.Provider value={{ authConfig, setAuthConfig }}>
      {children}
    </ApiKeyContext.Provider>
  )
}
