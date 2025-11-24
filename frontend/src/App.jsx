import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ContentPanel from './components/ContentPanel'
import ApiExplorer from './components/ApiExplorer'
import { ApiKeyProvider } from './contexts/ApiKeyContext'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('api') // 'api' or 'articles'
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    if (data?.ui_config) {
      const root = document.documentElement
      const ui = data.ui_config
      
      if (ui.colors) {
        if (ui.colors.primary) root.style.setProperty('--bd-primary', ui.colors.primary)
        if (ui.colors.secondary) {
          root.style.setProperty('--bd-secondary', ui.colors.secondary)
        }
        if (ui.colors.background) root.style.setProperty('--bd-background', ui.colors.background)
        if (ui.colors.surface) root.style.setProperty('--bd-surface', ui.colors.surface)
      }
      
      if (ui.corner_radius) {
        root.style.setProperty('--bd-corner-radius', ui.corner_radius)
      }
      
      if (ui.font_heading) {
        root.style.setProperty('--bd-font-heading', `'${ui.font_heading}', sans-serif`)
        // Dynamically load font
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${ui.font_heading.replace(/\s/g, '+')}:wght@500;600;700&display=swap`
        link.rel = 'stylesheet'
        if (!document.querySelector(`link[href*="${ui.font_heading}"]`)) {
          document.head.appendChild(link)
        }
      }
      
      if (ui.font_body) {
        root.style.setProperty('--bd-font-body', `'${ui.font_body}', sans-serif`)
        // Dynamically load font
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${ui.font_body.replace(/\s/g, '+')}:wght@400;500;600&display=swap`
        link.rel = 'stylesheet'
        if (!document.querySelector(`link[href*="${ui.font_body}"]`)) {
          document.head.appendChild(link)
        }
      }
    }
  }, [data])

  useEffect(() => {
    document.body.dataset.mounted = 'false'
    const timeout = setTimeout(() => {
      document.body.dataset.mounted = 'true'
    }, 0)

    return () => {
      clearTimeout(timeout)
      delete document.body.dataset.mounted
    }
  }, [])

  useEffect(() => {
    const initializeData = (payload) => {
      setData(payload)
      setLoading(false)
      
      if (payload.openapi?.paths) {
        const firstPath = Object.keys(payload.openapi.paths)[0]
        const firstMethod = Object.keys(payload.openapi.paths[firstPath])[0]
        setSelectedItem({ type: 'endpoint', path: firstPath, method: firstMethod })
      } else if (payload.articles?.length > 0) {
        setSelectedItem({ type: 'article', id: payload.articles[0].id })
      }
    }
    
    const tryInitialize = () => {
      if (window.BetterDocsData) {
        initializeData(window.BetterDocsData)
        return true
      }
      return false
    }
    
    if (!tryInitialize()) {
      const handleDataLoaded = () => {
        if (window.BetterDocsData) {
          initializeData(window.BetterDocsData)
        }
      }
      
      window.addEventListener('betterdocs:data_loaded', handleDataLoaded)
      
      // Fallback timeout so we don't wait forever
      const timeoutId = setTimeout(() => {
        if (!window.BetterDocsData) {
          console.error('BetterDocsData not found. Make sure data.js is loaded.')
          setLoading(false)
        }
      }, 5000)
      
      return () => {
        window.removeEventListener('betterdocs:data_loaded', handleDataLoaded)
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-3xl font-black text-black">Loading documentation...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-3xl font-black text-red-600">Error: Documentation data not found</div>
      </div>
    )
  }

  return (
    <ApiKeyProvider>
      <div className="app-shell">
        <Sidebar
          data={data}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
        <ContentPanel
          data={data}
          activeView={activeView}
          selectedItem={selectedItem}
        />
        <ApiExplorer
          data={data}
          selectedItem={selectedItem}
        />
      </div>
    </ApiKeyProvider>
  )
}

export default App

