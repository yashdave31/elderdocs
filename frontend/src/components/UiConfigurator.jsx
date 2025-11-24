import React, { useState, useEffect } from 'react'

const UiConfigurator = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  
  const [config, setConfig] = useState({
    font_heading: 'Syne',
    font_body: 'IBM Plex Sans',
    colors: {
      primary: '#f8d447',
      secondary: '#000000',
      background: '#ffffff',
      surface: '#ffffff'
    },
    corner_radius: '0px'
  })
  
  const availableFonts = [
    'Syne',
    'IBM Plex Sans',
    'Inter',
    'Space Grotesk',
    'Oswald',
    'Fira Code',
    'Roboto',
    'Open Sans'
  ]
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/docs/ui')
      if (response.ok) {
        const data = await response.json()
        setAuthenticated(true)
        if (data.ui_config) {
          setConfig({
            font_heading: data.ui_config.font_heading || 'Syne',
            font_body: data.ui_config.font_body || 'IBM Plex Sans',
            colors: {
              primary: data.ui_config.colors?.primary || '#f8d447',
              secondary: data.ui_config.colors?.secondary || '#000000',
              background: data.ui_config.colors?.background || '#ffffff',
              surface: data.ui_config.colors?.surface || '#ffffff'
            },
            corner_radius: data.ui_config.corner_radius || '0px'
          })
        }
      } else {
        setAuthenticated(false)
      }
    } catch (err) {
      setAuthenticated(false)
    }
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/docs/ui/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAuthenticated(true)
        await checkAuth()
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)
    
    try {
      const response = await fetch('/docs/ui/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          font_heading: config.font_heading,
          font_body: config.font_body,
          color_primary: config.colors.primary,
          color_secondary: config.colors.secondary,
          color_background: config.colors.background,
          color_surface: config.colors.surface,
          corner_radius: config.corner_radius
        }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        // Apply changes immediately
        applyConfig(config)
      } else {
        setError(data.error || 'Failed to save configuration')
      }
    } catch (err) {
      setError('Save failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/docs/ui/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setAuthenticated(false)
      setPassword('')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }
  
  const applyConfig = (newConfig) => {
    const root = document.documentElement
    root.style.setProperty('--bd-primary', newConfig.colors.primary)
    root.style.setProperty('--bd-secondary', newConfig.colors.secondary)
    root.style.setProperty('--bd-background', newConfig.colors.background)
    root.style.setProperty('--bd-surface', newConfig.colors.surface)
    root.style.setProperty('--bd-corner-radius', newConfig.corner_radius)
    root.style.setProperty('--bd-font-heading', `'${newConfig.font_heading}', sans-serif`)
    root.style.setProperty('--bd-font-body', `'${newConfig.font_body}', sans-serif`)
    
    // Load fonts
    if (newConfig.font_heading) {
      const linkHeading = document.createElement('link')
      linkHeading.href = `https://fonts.googleapis.com/css2?family=${newConfig.font_heading.replace(/\s/g, '+')}:wght@500;600;700&display=swap`
      linkHeading.rel = 'stylesheet'
      if (!document.querySelector(`link[href*="${newConfig.font_heading}"]`)) {
        document.head.appendChild(linkHeading)
      }
    }
    
    if (newConfig.font_body) {
      const linkBody = document.createElement('link')
      linkBody.href = `https://fonts.googleapis.com/css2?family=${newConfig.font_body.replace(/\s/g, '+')}:wght@400;500;600&display=swap`
      linkBody.rel = 'stylesheet'
      if (!document.querySelector(`link[href*="${newConfig.font_body}"]`)) {
        document.head.appendChild(linkBody)
      }
    }
  }
  
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="surface rounded-none p-8 max-w-md w-full">
          <h1 className="text-3xl font-black text-black mb-6 font-['Syne'] uppercase">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full text-sm bg-white border-black text-black"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-900 text-sm font-bold">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-xs text-black/60">
            Default password: <code className="bg-yellow-100 px-1">admin</code> (or set via <code className="bg-yellow-100 px-1">ELDERDOCS_ADMIN_PASSWORD</code> env var)
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="surface rounded-none p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-black text-black font-['Syne'] uppercase">UI Configuration</h1>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
          
          {saved && (
            <div className="mb-4 p-3 bg-green-100 border-2 border-green-500 text-green-900 text-sm font-bold">
              ✅ Configuration saved successfully! Refresh the page to see changes.
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-900 text-sm font-bold">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSave}>
            <div className="space-y-6">
              {/* Fonts */}
              <div>
                <h2 className="text-xl font-black text-black mb-4 font-['Syne'] uppercase">Typography</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Heading Font
                    </label>
                    <select
                      value={config.font_heading}
                      onChange={(e) => setConfig({ ...config, font_heading: e.target.value })}
                      className="input-field w-full text-sm bg-white border-black text-black"
                    >
                      {availableFonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Body Font
                    </label>
                    <select
                      value={config.font_body}
                      onChange={(e) => setConfig({ ...config, font_body: e.target.value })}
                      className="input-field w-full text-sm bg-white border-black text-black"
                    >
                      {availableFonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Colors */}
              <div>
                <h2 className="text-xl font-black text-black mb-4 font-['Syne'] uppercase">Colors</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, primary: e.target.value }
                        })}
                        className="w-16 h-10 border-2 border-black"
                      />
                      <input
                        type="text"
                        value={config.colors.primary}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, primary: e.target.value }
                        })}
                        className="input-field flex-1 text-sm bg-white border-black text-black font-mono"
                        placeholder="#f8d447"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, secondary: e.target.value }
                        })}
                        className="w-16 h-10 border-2 border-black"
                      />
                      <input
                        type="text"
                        value={config.colors.secondary}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, secondary: e.target.value }
                        })}
                        className="input-field flex-1 text-sm bg-white border-black text-black font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.colors.background}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, background: e.target.value }
                        })}
                        className="w-16 h-10 border-2 border-black"
                      />
                      <input
                        type="text"
                        value={config.colors.background}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, background: e.target.value }
                        })}
                        className="input-field flex-1 text-sm bg-white border-black text-black font-mono"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Surface Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.colors.surface}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, surface: e.target.value }
                        })}
                        className="w-16 h-10 border-2 border-black"
                      />
                      <input
                        type="text"
                        value={config.colors.surface}
                        onChange={(e) => setConfig({
                          ...config,
                          colors: { ...config.colors, surface: e.target.value }
                        })}
                        className="input-field flex-1 text-sm bg-white border-black text-black font-mono"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Corner Radius */}
              <div>
                <h2 className="text-xl font-black text-black mb-4 font-['Syne'] uppercase">Styling</h2>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Corner Radius: {config.corner_radius}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={parseInt(config.corner_radius) || 0}
                    onChange={(e) => setConfig({ ...config, corner_radius: `${e.target.value}px` })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-black/60 mt-1">
                    <span>Sharp (0px)</span>
                    <span>Rounded (24px)</span>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <h2 className="text-xl font-black text-black mb-4 font-['Syne'] uppercase">Preview</h2>
                <div className="surface rounded-none p-6" style={{
                  backgroundColor: config.colors.surface,
                  borderColor: config.colors.secondary,
                  borderRadius: config.corner_radius
                }}>
                  <div className="pill mb-4" style={{
                    backgroundColor: config.colors.primary,
                    color: config.colors.secondary,
                    borderColor: config.colors.secondary,
                    borderRadius: config.corner_radius
                  }}>
                    Sample Button
                  </div>
                  <h3 style={{
                    fontFamily: `'${config.font_heading}', sans-serif`,
                    color: config.colors.secondary
                  }}>
                    Heading Preview
                  </h3>
                  <p style={{
                    fontFamily: `'${config.font_body}', sans-serif`,
                    color: config.colors.secondary
                  }}>
                    This is how body text will look with your selected fonts and colors.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  type="button"
                  onClick={() => applyConfig(config)}
                  className="btn-secondary"
                >
                  Preview
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UiConfigurator

