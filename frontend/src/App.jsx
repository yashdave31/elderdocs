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
        // Map config colors to CSS variable names used in index.css
        if (ui.colors.primary) {
          root.style.setProperty('--bd-yellow', ui.colors.primary)
          root.style.setProperty('--bd-primary', ui.colors.primary) // Keep for compatibility
        }
        if (ui.colors.secondary) {
          root.style.setProperty('--bd-charcoal', ui.colors.secondary)
          root.style.setProperty('--bd-border', ui.colors.secondary)
          root.style.setProperty('--bd-ink', ui.colors.secondary)
          root.style.setProperty('--bd-secondary', ui.colors.secondary) // Keep for compatibility
        }
        if (ui.colors.background) {
          root.style.setProperty('--bd-white', ui.colors.background)
          root.style.setProperty('--bd-background', ui.colors.background) // Keep for compatibility
        }
        if (ui.colors.surface) {
          root.style.setProperty('--bd-panel', ui.colors.surface)
          root.style.setProperty('--bd-surface', ui.colors.surface) // Keep for compatibility
        }
      }
      
      if (ui.corner_radius) {
        root.style.setProperty('--bd-radius', ui.corner_radius)
        root.style.setProperty('--bd-corner-radius', ui.corner_radius) // Keep for compatibility
      }
      
      if (ui.font_heading) {
        root.style.setProperty('--font-heading', `'${ui.font_heading}', sans-serif`)
        root.style.setProperty('--bd-font-heading', `'${ui.font_heading}', sans-serif`) // Keep for compatibility
        // Dynamically load font
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${ui.font_heading.replace(/\s/g, '+')}:wght@500;600;700&display=swap`
        link.rel = 'stylesheet'
        if (!document.querySelector(`link[href*="${ui.font_heading}"]`)) {
          document.head.appendChild(link)
        }
      }
      
      if (ui.font_body) {
        root.style.setProperty('--font-body', `'${ui.font_body}', sans-serif`)
        root.style.setProperty('--bd-font-body', `'${ui.font_body}', sans-serif`) // Keep for compatibility
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
    const loadData = async () => {
      try {
        // Fetch all data in parallel
        const [definitionsRes, articlesRes, configRes] = await Promise.all([
          fetch('/docs/api/definitions'),
          fetch('/docs/api/articles'),
          fetch('/docs/api/config')
        ])
        
        if (!definitionsRes.ok) {
          throw new Error(`Failed to load definitions: ${definitionsRes.statusText}`)
        }
        
        const openapi = await definitionsRes.json()
        const articles = articlesRes.ok ? await articlesRes.json() : []
        const config = configRes.ok ? await configRes.json() : {}
        
        const payload = {
          openapi,
          articles,
          api_server: config.api_server || '',
          api_servers: config.api_servers || [],
          auth_types: config.auth_types || ['bearer', 'api_key', 'basic', 'oauth2'],
          ui_config: config.ui_config || {},
          generated_at: new Date().toISOString()
        }
        
        setData(payload)
        setLoading(false)
        
        if (payload.openapi?.paths) {
          const firstPath = Object.keys(payload.openapi.paths)[0]
          const firstMethod = Object.keys(payload.openapi.paths[firstPath])[0]
          setSelectedItem({ type: 'endpoint', path: firstPath, method: firstMethod })
        } else if (payload.articles?.length > 0) {
          setSelectedItem({ type: 'article', id: payload.articles[0].id })
        }
      } catch (error) {
        console.error('Failed to load ElderDocs data:', error)
        setLoading(false)
      }
    }
    
    loadData()
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

