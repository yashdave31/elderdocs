import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ContentPanel from './components/ContentPanel'
import ApiExplorer from './components/ApiExplorer'
import { ApiKeyProvider } from './contexts/ApiKeyContext'

const slugify = (value) => {
  if (!value) return ''
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const attachArticleSlug = (article) => {
  if (!article || typeof article !== 'object') return article
  const slugFromTitle = slugify(article.title)
  const slugFromId = slugify(article.id)
  const fallback = article.id ? article.id.toString().toLowerCase() : ''
  return {
    ...article,
    slug: slugFromTitle || slugFromId || fallback
  }
}

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

      // Update document title
      if (ui.page_title) {
        document.title = ui.page_title
      } else {
        document.title = 'ElderDocs - API Documentation'
      }

      // Handle favicon
      if (ui.favicon) {
        const mountPath = window.location.pathname.split('/').slice(0, -1).join('/') || '/docs'
        let faviconUrl = ui.favicon
        if (!faviconUrl.startsWith('http://') && !faviconUrl.startsWith('https://')) {
          const cleanPath = faviconUrl.startsWith('/') ? faviconUrl : `/${faviconUrl}`
          faviconUrl = `${mountPath}${cleanPath}`
        }
        
        // Remove existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
        existingFavicons.forEach(link => link.remove())
        
        // Add new favicon
        const faviconLink = document.createElement('link')
        faviconLink.rel = 'icon'
        faviconLink.type = getFaviconType(faviconUrl)
        faviconLink.href = faviconUrl
        document.head.appendChild(faviconLink)
      }
    }
  }, [data])

  const getFaviconType = (url) => {
    if (url.endsWith('.svg')) return 'image/svg+xml'
    if (url.endsWith('.png')) return 'image/png'
    if (url.endsWith('.ico')) return 'image/x-icon'
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg'
    return 'image/x-icon'
  }

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
        const articlesWithSlugs = Array.isArray(articles) ? articles.map(attachArticleSlug) : []
        const config = configRes.ok ? await configRes.json() : {}
        
        const payload = {
          openapi,
          articles: articlesWithSlugs,
          api_server: config.api_server || '',
          api_servers: config.api_servers || [],
          auth_types: config.auth_types || ['bearer', 'api_key', 'basic', 'oauth2'],
          ui_config: config.ui_config || {},
          generated_at: new Date().toISOString()
        }
        
        setData(payload)
        setLoading(false)
        
        let initialSelectionSet = false
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.replace('#', '').toLowerCase()
          const articleFromHash = articlesWithSlugs.find(article => article.slug === hash)
          if (articleFromHash) {
            setActiveView('articles')
            setSelectedItem({ type: 'article', id: articleFromHash.id })
            initialSelectionSet = true
          }
        }
        
        if (!initialSelectionSet) {
          if (payload.openapi?.paths) {
            const firstPath = Object.keys(payload.openapi.paths)[0]
            const firstMethod = Object.keys(payload.openapi.paths[firstPath])[0]
            setSelectedItem({ type: 'endpoint', path: firstPath, method: firstMethod })
          } else if (payload.articles?.length > 0) {
            setSelectedItem({ type: 'article', id: payload.articles[0].id })
          }
        }
      } catch (error) {
        console.error('Failed to load ElderDocs data:', error)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    if (!data?.articles?.length || typeof window === 'undefined') return

    const selectArticleFromHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase()
      if (!hash) return
      const article = data.articles.find(a => a.slug === hash)
      if (article) {
        if (selectedItem?.type === 'article' && selectedItem.id === article.id) {
          return
        }
        setActiveView('articles')
        setSelectedItem({ type: 'article', id: article.id })
      }
    }

    selectArticleFromHash()
    window.addEventListener('hashchange', selectArticleFromHash)

    return () => {
      window.removeEventListener('hashchange', selectArticleFromHash)
    }
  }, [data, selectedItem])

  useEffect(() => {
    if (!data?.articles?.length || typeof window === 'undefined') return

    if (selectedItem?.type === 'article') {
      const article = data.articles.find(a => a.id === selectedItem.id)
      if (article?.slug && window.location.hash.replace('#', '').toLowerCase() !== article.slug) {
        window.location.hash = article.slug
      }
    } else if (window.location.hash) {
      const newUrl = `${window.location.pathname}${window.location.search}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [selectedItem, data])

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

  const showFooter = data?.ui_config?.show_powered_by_footer !== false

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
        {showFooter && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black/10 p-3 text-center z-10">
            <p className="text-xs text-black/60 font-medium">Powered by ElderDocs</p>
          </footer>
        )}
      </div>
    </ApiKeyProvider>
  )
}

export default App

