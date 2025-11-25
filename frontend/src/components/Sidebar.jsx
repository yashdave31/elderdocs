import React from 'react'

const Sidebar = ({ data, activeView, setActiveView, selectedItem, setSelectedItem }) => {
  const openapiPaths = data?.openapi?.paths || {}
  const articles = data?.articles || []

  const badgeColor = (method) => {
    switch (method) {
      case 'get':
        return 'bg-emerald-100 text-emerald-900 border-emerald-900'
      case 'post':
        return 'bg-blue-100 text-blue-900 border-blue-900'
      case 'put':
        return 'bg-amber-100 text-amber-900 border-amber-900'
      case 'delete':
        return 'bg-red-100 text-red-900 border-red-900'
      default:
        return 'bg-gray-100 text-gray-900 border-gray-900'
    }
  }

  const renderApiNavigation = () => (
    Object.entries(openapiPaths).map(([path, methods], sectionIdx) => (
      <div
        key={path}
        className="mb-6 reveal"
        style={{ animationDelay: `${120 + sectionIdx * 60}ms` }}
      >
        <p className="text-[0.6rem] uppercase tracking-[0.35em] text-black/40 mb-2 px-1 font-bold">{path}</p>
        <div className="space-y-2">
          {Object.entries(methods).map(([method, operation], idx) => {
            const isSelected = selectedItem?.type === 'endpoint' &&
              selectedItem?.path === path &&
              selectedItem?.method === method

            return (
              <button
                key={`${path}-${method}`}
                onClick={() => setSelectedItem({ type: 'endpoint', path, method })}
                className={`nav-card w-full text-left px-4 py-3 flex items-center gap-3 ${
                  isSelected ? 'nav-card--active' : ''
                }`}
                style={{ animationDelay: `${200 + idx * 40}ms` }}
              >
                <span className={`chip ${badgeColor(method)}`}>
                  {method}
                </span>
                <span className={`text-[0.8rem] font-bold tracking-[0.05em] ${isSelected ? 'text-black' : 'text-black/80'}`}>
                  {operation.summary || path}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    ))
  )

  const renderArticlesNavigation = () => {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return (
        <div className="text-center p-8 text-black/60">
          <p className="text-sm font-medium">No guides available</p>
        </div>
      )
    }
    
    return (
      <>
        {articles.map((article, idx) => {
          if (!article || !article.id) return null
          
          const isSelected = selectedItem?.type === 'article' && selectedItem?.id === article.id

          return (
            <button
              key={article.id}
              onClick={() => {
                if (article && article.id) {
                  setSelectedItem({ type: 'article', id: article.id })
                }
              }}
              className={`nav-card w-full text-left px-4 py-3 ${
                isSelected ? 'nav-card--active' : ''
              } reveal`}
              style={{ animationDelay: `${180 + idx * 60}ms` }}
            >
              <span className={`text-[0.82rem] font-bold tracking-[0.05em] ${isSelected ? 'text-black' : 'text-black/80'}`}>
                {article.title || 'Untitled'}
              </span>
            </button>
          )
        })}
      </>
    )
  }

  const uiConfig = data?.ui_config || {}
  const logoUrl = uiConfig.logo
  const apiSpaceText = uiConfig.api_space_text || 'API Space'
  const mountPath = window.location.pathname.split('/').slice(0, -1).join('/') || '/docs'
  
  // Construct full URL for logo if it's a relative path
  const getLogoUrl = () => {
    if (!logoUrl) return null
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl
    }
    // If it's a relative path, prepend the mount path
    const cleanPath = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`
    return `${mountPath}${cleanPath}`
  }

  return (
    <div className="w-80 surface border-r-0 border-black/10 flex flex-col h-full relative overflow-hidden" style={{ borderRightWidth: '3px' }}>
      <div className="p-6 border-b-0 border-black/10 relative" style={{ borderBottomWidth: '3px' }}>
        <div className="pill text-[0.65rem] text-black mb-3 bg-white">ElderDocs</div>
        <div className="flex items-center gap-3 mb-3">
          {logoUrl && (
            <img 
              src={getLogoUrl()} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
          <h1 className="font-black text-3xl tracking-tight text-black uppercase font-['Syne']">{apiSpaceText}</h1>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              setActiveView('api')
              // Auto-select first endpoint if none selected
              if (!selectedItem || selectedItem.type !== 'endpoint') {
                const firstPath = Object.keys(openapiPaths)[0]
                if (firstPath) {
                  const firstMethod = Object.keys(openapiPaths[firstPath])[0]
                  setSelectedItem({ type: 'endpoint', path: firstPath, method: firstMethod })
                }
              }
            }}
            className={`flex-1 btn-secondary ${
              activeView === 'api' ? 'bg-yellow-400 !text-black !border-black' : ''
            }`}
          >
            API
          </button>
          <button
            onClick={() => {
              setActiveView('articles')
              // Auto-select first article if none selected or if current selection is not an article
              if (!selectedItem || selectedItem.type !== 'article') {
                if (articles && Array.isArray(articles) && articles.length > 0 && articles[0] && articles[0].id) {
                  setSelectedItem({ type: 'article', id: articles[0].id })
                }
              }
            }}
            className={`flex-1 btn-secondary ${
              activeView === 'articles' ? 'bg-yellow-400 !text-black !border-black' : ''
            }`}
          >
            Guides
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 relative bg-white">
        {activeView === 'api' ? renderApiNavigation() : renderArticlesNavigation()}
      </div>
    </div>
  )
}

export default Sidebar
