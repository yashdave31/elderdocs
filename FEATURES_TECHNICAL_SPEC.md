# ElderDocs - Technical Feature Specifications

This document outlines the technical requirements, implementation details, and suggestions for each feature planned for ElderDocs.

---

## Table of Contents

1. [API Runner Enhancements](#1-api-runner-enhancements)
2. [Markdown Editor for Guides](#2-markdown-editor-for-guides)
3. [API Versioning](#3-api-versioning)
4. [Customizable Themes](#4-customizable-themes)
5. [Changelog Feature](#5-changelog-feature)
6. [Discussion Forum](#6-discussion-forum)
7. [Landing Page Customization](#7-landing-page-customization)
8. [Remove ElderDocs Branding](#8-remove-elderdocs-branding)
9. [Export Usage Metrics](#9-export-usage-metrics)
10. [Self-Hosted & Hosted Plans](#10-self-hosted--hosted-plans)

---

## 1. API Runner Enhancements

### Current State
- ✅ Basic API runner exists in `ApiExplorer.jsx`
- ✅ Supports Bearer, API Key, Basic, and OAuth2 authentication
- ✅ cURL preview is already implemented
- ✅ Uses `fetch` API for requests
- ⚠️ Limited to JavaScript fetch only

### Requirements

#### 1.1 Enhanced cURL Support
**Current Implementation:**
- Basic cURL generation exists (`generateCurl()` function)
- Shows/hides cURL preview
- Copy to clipboard functionality

**Enhancements Needed:**
1. **cURL Format Options:**
   - Pretty-printed multi-line format (current)
   - Single-line format option
   - Escaped format for shell scripts
   - PowerShell format (`Invoke-WebRequest`)

2. **cURL Export Options:**
   - Download as `.sh` script
   - Download as `.ps1` (PowerShell) script
   - Copy with different formatting options

**Implementation:**
```javascript
// Add to ApiExplorer.jsx
const [curlFormat, setCurlFormat] = useState('multiline') // 'multiline' | 'single' | 'escaped' | 'powershell'

const generateCurl = (format = curlFormat) => {
  // Existing logic...
  
  switch(format) {
    case 'single':
      return curlParts.join(' ')
    case 'escaped':
      return curlParts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(' ')
    case 'powershell':
      return generatePowerShellCommand()
    default:
      return curlParts.join(' \\\n  ')
  }
}
```

#### 1.2 Language Code Generation
**New Feature:** Generate code snippets in multiple languages

**Supported Languages:**
- JavaScript (fetch, axios)
- Python (requests, httpx)
- Ruby (Net::HTTP, HTTParty)
- PHP (cURL, Guzzle)
- Go (net/http)
- Java (OkHttp, HttpClient)
- C# (HttpClient)
- Swift (URLSession)
- Kotlin (OkHttp)

**Implementation:**

**Backend (Ruby):**
```ruby
# lib/elder_docs/code_generator.rb
module ElderDocs
  class CodeGenerator
    LANGUAGES = {
      javascript: { name: 'JavaScript', variants: ['fetch', 'axios'] },
      python: { name: 'Python', variants: ['requests', 'httpx'] },
      ruby: { name: 'Ruby', variants: ['net_http', 'httparty'] },
      # ... more languages
    }.freeze

    def self.generate(request_data, language:, variant: nil)
      generator_class = "ElderDocs::CodeGenerators::#{language.to_s.camelize}".constantize
      generator_class.new(request_data).generate(variant: variant)
    end
  end
end

# lib/elder_docs/code_generators/javascript.rb
module ElderDocs
  module CodeGenerators
    class Javascript
      def initialize(request_data)
        @url = request_data[:url]
        @method = request_data[:method]
        @headers = request_data[:headers] || {}
        @body = request_data[:body]
      end

      def generate(variant: 'fetch')
        case variant
        when 'fetch'
          generate_fetch
        when 'axios'
          generate_axios
        end
      end

      private

      def generate_fetch
        <<~JS
          const response = await fetch('#{@url}', {
            method: '#{@method}',
            headers: {
              #{format_headers}
            }#{@body ? ",\n    body: #{format_body}" : ''}
          });
          
          const data = await response.json();
          console.log(data);
        JS
      end

      def format_headers
        @headers.map { |k, v| "'#{k}': '#{v}'" }.join(",\n              ")
      end

      def format_body
        return "JSON.stringify(#{@body})" if @body
        ''
      end
    end
  end
end
```

**Frontend:**
```javascript
// frontend/src/components/CodeGenerator.jsx
import React, { useState } from 'react'

const CodeGenerator = ({ requestData }) => {
  const [language, setLanguage] = useState('javascript')
  const [variant, setVariant] = useState('fetch')
  const [code, setCode] = useState('')

  useEffect(() => {
    generateCode()
  }, [language, variant, requestData])

  const generateCode = async () => {
    const response = await fetch('/docs/api/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, variant, request_data: requestData })
    })
    const { code: generatedCode } = await response.json()
    setCode(generatedCode)
  }

  return (
    <div className="code-generator">
      <div className="flex gap-2 mb-4">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="ruby">Ruby</option>
          {/* ... more options */}
        </select>
        <select value={variant} onChange={(e) => setVariant(e.target.value)}>
          {/* Variant options based on language */}
        </select>
      </div>
      <SyntaxHighlighter language={language} style={oneDark}>
        {code}
      </SyntaxHighlighter>
      <button onClick={() => copyToClipboard(code)}>Copy</button>
    </div>
  )
}
```

**API Endpoint:**
```ruby
# lib/elder_docs/engine/api_controller.rb
def generate_code
  request_data = params[:request_data]
  language = params[:language] || 'javascript'
  variant = params[:variant]

  code = ElderDocs::CodeGenerator.generate(
    request_data,
    language: language.to_sym,
    variant: variant
  )

  render json: { code: code }
end
```

**Routes:**
```ruby
# lib/elder_docs/engine.rb
post '/api/generate-code', to: 'engine/api#generate_code'
```

### Database Changes
None required - stateless code generation

### Frontend Changes
1. Add language selector dropdown in `ApiExplorer.jsx`
2. Add variant selector (conditional on language)
3. Integrate `CodeGenerator` component
4. Add syntax highlighting for all supported languages
5. Add copy/download buttons for each language

### Ideas & Suggestions
1. **Code Templates:** Allow users to customize code templates
2. **Environment Variables:** Support for environment variable substitution (e.g., `process.env.API_KEY`)
3. **SDK Integration:** Link to official SDKs if available
4. **Code History:** Save frequently used code snippets
5. **Testing Integration:** Generate test code (Jest, pytest, RSpec, etc.)

---

## 2. Markdown Editor for Guides

### Current State
- ✅ Articles stored in `articles.json`
- ✅ Markdown content rendered in `ContentPanel.jsx`
- ⚠️ No editor - manual JSON editing required
- ⚠️ No preview while editing

### Requirements

#### 2.1 Markdown Editor Component
**Features Needed:**
1. **Rich Text Editor:**
   - WYSIWYG markdown editor
   - Split view (editor + preview)
   - Live preview
   - Syntax highlighting

2. **Editor Capabilities:**
   - Full markdown support (headers, lists, code blocks, tables, etc.)
   - Image upload/embedding
   - Link insertion
   - Code block with language selection
   - Table editor
   - Emoji picker

3. **Article Management:**
   - Create new articles
   - Edit existing articles
   - Delete articles
   - Reorder articles
   - Article metadata (id, title, related_path)

**Implementation:**

**Backend - Article Management API:**
```ruby
# lib/elder_docs/engine/articles_controller.rb
module ElderDocs
  class Engine
    class ArticlesController < ActionController::API
      before_action :authenticate_admin!

      def index
        articles = load_articles
        render json: articles
      end

      def show
        article = find_article(params[:id])
        render json: article
      end

      def create
        article = build_article_from_params
        articles = load_articles
        articles << article
        save_articles(articles)
        render json: article, status: :created
      end

      def update
        articles = load_articles
        index = articles.find_index { |a| a['id'] == params[:id] }
        
        if index
          articles[index] = build_article_from_params
          save_articles(articles)
          render json: articles[index]
        else
          render json: { error: 'Article not found' }, status: :not_found
        end
      end

      def destroy
        articles = load_articles
        articles.reject! { |a| a['id'] == params[:id] }
        save_articles(articles)
        head :no_content
      end

      def reorder
        article_ids = params[:article_ids]
        articles = load_articles
        reordered = article_ids.map { |id| articles.find { |a| a['id'] == id } }.compact
        save_articles(reordered)
        render json: reordered
      end

      private

      def authenticate_admin!
        # Use same auth as UI configurator
        password = request.headers['X-Admin-Password'] || params[:password]
        admin_password = ElderDocs.config.admin_password || ENV['ELDERDOCS_ADMIN_PASSWORD'] || 'admin'
        
        unless password == admin_password
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end

      def load_articles
        articles_path = find_articles_file
        return [] unless articles_path && File.exist?(articles_path)
        JSON.parse(File.read(articles_path, encoding: 'UTF-8'))
      end

      def save_articles(articles)
        articles_path = find_articles_file || create_articles_file
        File.write(articles_path, JSON.pretty_generate(articles))
      end

      def build_article_from_params
        {
          'id' => params[:id] || generate_id(params[:title]),
          'title' => params[:title],
          'markdown_content' => params[:markdown_content] || '',
          'related_path' => params[:related_path]
        }.compact
      end

      def generate_id(title)
        title.to_s.downcase.gsub(/[^a-z0-9]+/, '_').gsub(/^_|_$/, '')
      end

      def find_articles_file
        # Reuse logic from api_controller.rb
        ElderDocs::Engine::ApiController.new.send(:find_articles_file)
      end

      def create_articles_file
        default_path = if defined?(Rails) && Rails.root
          Rails.root.join('articles.json').to_s
        else
          File.join(Dir.pwd, 'articles.json')
        end
        File.write(default_path, [].to_json) unless File.exist?(default_path)
        default_path
      end
    end
  end
end
```

**Routes:**
```ruby
# lib/elder_docs/engine.rb
namespace :api do
  resources :articles, controller: 'engine/articles', only: [:index, :show, :create, :update, :destroy]
  post 'articles/reorder', to: 'engine/articles#reorder'
end
```

**Frontend - Markdown Editor:**
```javascript
// frontend/src/components/MarkdownEditor.jsx
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

const MarkdownEditor = ({ article, onSave, onCancel }) => {
  const [content, setContent] = useState(article?.markdown_content || '')
  const [title, setTitle] = useState(article?.title || '')
  const [relatedPath, setRelatedPath] = useState(article?.related_path || '')
  const [viewMode, setViewMode] = useState('split') // 'edit' | 'preview' | 'split'
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = article 
        ? `/docs/api/articles/${article.id}`
        : '/docs/api/articles'
      
      const method = article ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getAdminPassword()
        },
        body: JSON.stringify({
          id: article?.id || generateId(title),
          title,
          markdown_content: content,
          related_path: relatedPath || null
        })
      })

      if (response.ok) {
        const savedArticle = await response.json()
        onSave(savedArticle)
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="markdown-editor">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title"
          className="title-input"
        />
        <input
          type="text"
          value={relatedPath}
          onChange={(e) => setRelatedPath(e.target.value)}
          placeholder="Related API Path (optional)"
          className="path-input"
        />
        <div className="view-mode-toggle">
          <button onClick={() => setViewMode('edit')}>Edit</button>
          <button onClick={() => setViewMode('preview')}>Preview</button>
          <button onClick={() => setViewMode('split')}>Split</button>
        </div>
      </div>

      <div className={`editor-body ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="markdown-input"
            placeholder="Write your markdown here..."
          />
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !title || !content}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
```

**Dependencies:**
```json
// frontend/package.json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

### Database Changes
None - articles stored in JSON file

### Frontend Changes
1. Create `MarkdownEditor.jsx` component
2. Add article management UI (list, create, edit, delete)
3. Add drag-and-drop reordering
4. Integrate with existing `ContentPanel` for preview
5. Add image upload functionality (store in public directory)

### Ideas & Suggestions
1. **Templates:** Pre-built article templates (Getting Started, Authentication, etc.)
2. **Version History:** Track changes to articles (git-like diff view)
3. **Collaboration:** Multiple admins editing with conflict resolution
4. **Media Library:** Centralized image/media management
5. **Auto-save:** Draft saving every few seconds
6. **Keyboard Shortcuts:** Markdown shortcuts (Cmd+B for bold, etc.)
7. **Table Editor:** Visual table builder
8. **Link Checker:** Validate internal/external links

---

## 3. API Versioning

### Current State
- ⚠️ Single version support only
- ⚠️ No version management
- ⚠️ No version switching UI

### Requirements

#### 3.1 Version Management System
**Features Needed:**
1. **Multiple API Versions:**
   - Each version has its own `definitions.json`
   - Each version can have its own `articles.json`
   - Version metadata (version number, release date, status)

2. **Version Switching:**
   - Version selector in UI
   - URL-based versioning (`/docs/v1/`, `/docs/v2/`)
   - Default version configuration

3. **Version Comparison:**
   - Compare endpoints between versions
   - Highlight changes (added, removed, modified)

**Implementation:**

**Backend - Version Structure:**
```ruby
# Directory structure:
# elderdocs/
#   v1/
#     definitions.json
#     articles.json
#   v2/
#     definitions.json
#     articles.json
#   versions.json (metadata)

# lib/elder_docs/version_manager.rb
module ElderDocs
  class VersionManager
    def self.list_versions
      versions_file = find_versions_file
      return [] unless versions_file && File.exist?(versions_file)
      
      JSON.parse(File.read(versions_file, encoding: 'UTF-8'))
    end

    def self.get_version(version_id)
      versions = list_versions
      versions.find { |v| v['id'] == version_id }
    end

    def self.get_definitions(version_id)
      version_dir = version_directory(version_id)
      definitions_path = File.join(version_dir, 'definitions.json')
      
      return nil unless File.exist?(definitions_path)
      JSON.parse(File.read(definitions_path, encoding: 'UTF-8'))
    end

    def self.get_articles(version_id)
      version_dir = version_directory(version_id)
      articles_path = File.join(version_dir, 'articles.json')
      
      return [] unless File.exist?(articles_path)
      JSON.parse(File.read(articles_path, encoding: 'UTF-8'))
    end

    def self.create_version(version_data)
      version_id = version_data['id'] || version_data['version']
      version_dir = version_directory(version_id)
      FileUtils.mkdir_p(version_dir)

      # Create definitions.json if provided
      if version_data['definitions']
        File.write(
          File.join(version_dir, 'definitions.json'),
          JSON.pretty_generate(version_data['definitions'])
        )
      end

      # Create articles.json if provided
      if version_data['articles']
        File.write(
          File.join(version_dir, 'articles.json'),
          JSON.pretty_generate(version_data['articles'])
        )
      end

      # Update versions.json
      versions = list_versions
      existing = versions.find_index { |v| v['id'] == version_id }
      
      version_metadata = {
        'id' => version_id,
        'version' => version_data['version'],
        'name' => version_data['name'],
        'status' => version_data['status'] || 'active', # active, deprecated, sunset
        'release_date' => version_data['release_date'] || Date.today.iso8601,
        'deprecation_date' => version_data['deprecation_date'],
        'sunset_date' => version_data['sunset_date'],
        'description' => version_data['description']
      }

      if existing
        versions[existing] = version_metadata
      else
        versions << version_metadata
      end

      save_versions(versions)
      version_metadata
    end

    def self.default_version
      versions = list_versions
      default = versions.find { |v| v['status'] == 'active' && v['default'] }
      default || versions.find { |v| v['status'] == 'active' }
      default || versions.last
    end

    private

    def self.find_versions_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'versions.json')
    end

    def self.version_directory(version_id)
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', version_id.to_s)
    end

    def self.save_versions(versions)
      versions_file = find_versions_file
      FileUtils.mkdir_p(File.dirname(versions_file))
      File.write(versions_file, JSON.pretty_generate(versions))
    end
  end
end
```

**API Controller:**
```ruby
# lib/elder_docs/engine/api_controller.rb
def definitions
  version_id = params[:version] || ElderDocs::VersionManager.default_version&.dig('id')
  
  if version_id
    definitions = ElderDocs::VersionManager.get_definitions(version_id)
    if definitions
      render json: definitions
    else
      render json: { error: "Version #{version_id} not found" }, status: :not_found
    end
  else
    # Fallback to legacy single version
    definitions_path = find_definitions_file
    if definitions_path && File.exist?(definitions_path)
      render json: JSON.parse(File.read(definitions_path, encoding: 'UTF-8'))
    else
      render json: { error: 'definitions.json not found' }, status: :not_found
    end
  end
end

def articles
  version_id = params[:version] || ElderDocs::VersionManager.default_version&.dig('id')
  
  if version_id
    articles = ElderDocs::VersionManager.get_articles(version_id)
    render json: articles
  else
    # Fallback to legacy
    articles_path = find_articles_file
    if articles_path && File.exist?(articles_path)
      render json: JSON.parse(File.read(articles_path, encoding: 'UTF-8'))
    else
      render json: []
    end
  end
end

def versions
  versions = ElderDocs::VersionManager.list_versions
  render json: versions
end
```

**Routes:**
```ruby
# lib/elder_docs/engine.rb
get '/api/versions', to: 'engine/api#versions'
get '/api/definitions', to: 'engine/api#definitions'
get '/api/articles', to: 'engine/api#articles'
# Support versioned routes
get '/v:version/api/definitions', to: 'engine/api#definitions'
get '/v:version/api/articles', to: 'engine/api#articles'
```

**Frontend - Version Selector:**
```javascript
// frontend/src/components/VersionSelector.jsx
import React, { useState, useEffect } from 'react'

const VersionSelector = ({ currentVersion, onVersionChange }) => {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVersions()
  }, [])

  const loadVersions = async () => {
    try {
      const response = await fetch('/docs/api/versions')
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      console.error('Failed to load versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVersionChange = (versionId) => {
    onVersionChange(versionId)
    // Update URL
    const newUrl = `/docs/v${versionId}${window.location.hash}`
    window.history.pushState({}, '', newUrl)
  }

  return (
    <div className="version-selector">
      <select
        value={currentVersion}
        onChange={(e) => handleVersionChange(e.target.value)}
        className="version-dropdown"
      >
        {versions.map(version => (
          <option key={version.id} value={version.id}>
            {version.name || `v${version.version}`}
            {version.status === 'deprecated' && ' (Deprecated)'}
            {version.status === 'sunset' && ' (Sunset)'}
          </option>
        ))}
      </select>
      {versions.find(v => v.id === currentVersion)?.status === 'deprecated' && (
        <div className="deprecation-warning">
          ⚠️ This version is deprecated. Please migrate to a newer version.
        </div>
      )}
    </div>
  )
}
```

**App.jsx Integration:**
```javascript
// Extract version from URL
const versionFromUrl = window.location.pathname.match(/\/v(\d+)/)?.[1]

useEffect(() => {
  const loadData = async () => {
    const version = versionFromUrl || 'default'
    const versionParam = version !== 'default' ? `?version=${version}` : ''
    
    const [definitionsRes, articlesRes, configRes] = await Promise.all([
      fetch(`/docs/api/definitions${versionParam}`),
      fetch(`/docs/api/articles${versionParam}`),
      fetch('/docs/api/config')
    ])
    // ... rest of loading logic
  }
}, [versionFromUrl])
```

### Database Changes
None - versions stored in file system

### File Structure Changes
```
elderdocs/
  versions.json
  v1/
    definitions.json
    articles.json
  v2/
    definitions.json
    articles.json
```

### Frontend Changes
1. Add `VersionSelector` component
2. Update `App.jsx` to handle versioned routes
3. Add version comparison UI (optional)
4. Show deprecation warnings
5. Update URL handling for version switching

### Ideas & Suggestions
1. **Version Migration Guide:** Auto-generate migration guides between versions
2. **Diff View:** Visual diff of API changes between versions
3. **Version Aliases:** Support semantic versioning (v1.0.0, v1.1.0)
4. **Deprecation Timeline:** Show countdown to sunset date
5. **Version Analytics:** Track which versions are most used
6. **Backward Compatibility Checker:** Validate backward compatibility

---

## 4. Customizable Themes

### Current State
- ✅ Basic theme customization exists (`UiConfigurator.jsx`)
- ✅ Supports colors, fonts, corner radius
- ✅ Admin UI for configuration
- ⚠️ Limited customization options
- ⚠️ No theme presets or templates

### Requirements

#### 4.1 Enhanced Theme System
**Features Needed:**
1. **Theme Presets:**
   - Pre-built themes (Dark, Light, High Contrast, etc.)
   - Custom theme creation
   - Theme import/export

2. **Advanced Customization:**
   - More color options (accent, success, warning, error)
   - Typography scale (heading sizes, line heights)
   - Spacing system
   - Component-specific styling
   - Custom CSS injection

3. **Theme Management:**
   - Save multiple themes
   - Switch between themes
   - Preview before applying

**Implementation:**

**Backend - Theme Storage:**
```ruby
# lib/elder_docs/theme_manager.rb
module ElderDocs
  class ThemeManager
    THEME_PRESETS = {
      'default' => {
        name: 'Default',
        colors: {
          primary: '#f8d447',
          secondary: '#000000',
          background: '#ffffff',
          surface: '#ffffff'
        },
        fonts: {
          heading: 'Syne',
          body: 'IBM Plex Sans'
        },
        corner_radius: '0px'
      },
      'dark' => {
        name: 'Dark Mode',
        colors: {
          primary: '#f8d447',
          secondary: '#ffffff',
          background: '#1a1a1a',
          surface: '#2d2d2d'
        },
        fonts: {
          heading: 'Syne',
          body: 'IBM Plex Sans'
        },
        corner_radius: '4px'
      },
      # ... more presets
    }.freeze

    def self.list_themes
      themes_file = find_themes_file
      return THEME_PRESETS.keys.map { |id| { id: id, **THEME_PRESETS[id] } } unless themes_file && File.exist?(themes_file)
      
      custom_themes = JSON.parse(File.read(themes_file, encoding: 'UTF-8'))
      preset_themes = THEME_PRESETS.keys.map { |id| { id: id, **THEME_PRESETS[id] } }
      preset_themes + custom_themes
    end

    def self.get_theme(theme_id)
      if THEME_PRESETS.key?(theme_id)
        { id: theme_id, **THEME_PRESETS[theme_id] }
      else
        themes = list_themes
        themes.find { |t| t['id'] == theme_id }
      end
    end

    def self.save_theme(theme_data)
      themes_file = find_themes_file
      FileUtils.mkdir_p(File.dirname(themes_file))
      
      themes = []
      if File.exist?(themes_file)
        themes = JSON.parse(File.read(themes_file, encoding: 'UTF-8'))
      end
      
      existing_index = themes.find_index { |t| t['id'] == theme_data['id'] }
      if existing_index
        themes[existing_index] = theme_data
      else
        themes << theme_data
      end
      
      File.write(themes_file, JSON.pretty_generate(themes))
      theme_data
    end

    def self.delete_theme(theme_id)
      return false if THEME_PRESETS.key?(theme_id) # Can't delete presets
      
      themes_file = find_themes_file
      return false unless File.exist?(themes_file)
      
      themes = JSON.parse(File.read(themes_file, encoding: 'UTF-8'))
      themes.reject! { |t| t['id'] == theme_id }
      File.write(themes_file, JSON.pretty_generate(themes))
      true
    end

    private

    def self.find_themes_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'themes.json')
    end
  end
end
```

**API Endpoints:**
```ruby
# lib/elder_docs/engine/ui_config_controller.rb
def themes
  themes = ElderDocs::ThemeManager.list_themes
  render json: themes
end

def theme
  theme = ElderDocs::ThemeManager.get_theme(params[:id])
  if theme
    render json: theme
  else
    render json: { error: 'Theme not found' }, status: :not_found
  end
end

def save_theme
  theme = ElderDocs::ThemeManager.save_theme(params[:theme])
  render json: theme
end

def delete_theme
  success = ElderDocs::ThemeManager.delete_theme(params[:id])
  if success
    head :no_content
  else
    render json: { error: 'Failed to delete theme' }, status: :unprocessable_entity
  end
end
```

**Frontend - Enhanced Theme Editor:**
```javascript
// frontend/src/components/ThemeEditor.jsx
const ThemeEditor = () => {
  const [themes, setThemes] = useState([])
  const [currentTheme, setCurrentTheme] = useState(null)
  const [customCss, setCustomCss] = useState('')

  const applyTheme = async (themeId) => {
    const theme = await fetch(`/docs/ui/theme/${themeId}`).then(r => r.json())
    setCurrentTheme(theme)
    applyThemeToDocument(theme)
  }

  const applyThemeToDocument = (theme) => {
    const root = document.documentElement
    
    // Apply colors
    Object.entries(theme.colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Apply fonts
    if (theme.fonts?.heading) {
      root.style.setProperty('--font-heading', `'${theme.fonts.heading}', sans-serif`)
    }
    if (theme.fonts?.body) {
      root.style.setProperty('--font-body', `'${theme.fonts.body}', sans-serif`)
    }
    
    // Apply custom CSS
    if (customCss) {
      let styleTag = document.getElementById('elderdocs-custom-css')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'elderdocs-custom-css'
        document.head.appendChild(styleTag)
      }
      styleTag.textContent = customCss
    }
  }

  return (
    <div className="theme-editor">
      <div className="theme-presets">
        <h3>Theme Presets</h3>
        {themes.map(theme => (
          <div key={theme.id} className="theme-card" onClick={() => applyTheme(theme.id)}>
            <div className="theme-preview" style={{ backgroundColor: theme.colors?.background }}>
              {/* Preview colors */}
            </div>
            <span>{theme.name}</span>
          </div>
        ))}
      </div>
      
      <div className="custom-css-editor">
        <h3>Custom CSS</h3>
        <textarea
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          placeholder="Add custom CSS here..."
        />
      </div>
    </div>
  )
}
```

### Database Changes
None - themes stored in JSON file

### Frontend Changes
1. Enhance `UiConfigurator.jsx` with theme presets
2. Add theme preview cards
3. Add custom CSS editor
4. Add theme import/export functionality
5. Add more color customization options

### Ideas & Suggestions
1. **Theme Marketplace:** Share themes with community
2. **CSS Variables:** Expose all CSS variables for customization
3. **Component-Level Styling:** Style individual components
4. **Responsive Themes:** Different themes for mobile/desktop
5. **Animation Settings:** Customize transitions and animations
6. **Accessibility Themes:** High contrast, large text options

---

## 5. Changelog Feature

### Current State
- ⚠️ No changelog feature exists

### Requirements

#### 5.1 Changelog System
**Features Needed:**
1. **Changelog Entries:**
   - Version-based changelogs
   - Categorized changes (Added, Changed, Fixed, Deprecated, Removed, Security)
   - Rich text support (markdown)
   - Release dates
   - Links to related documentation

2. **Changelog Display:**
   - Timeline view
   - Filter by category
   - Search functionality
   - RSS feed support

**Implementation:**

**Backend - Changelog Storage:**
```ruby
# lib/elder_docs/changelog_manager.rb
module ElderDocs
  class ChangelogManager
    CATEGORIES = %w[added changed fixed deprecated removed security].freeze

    def self.list_entries(version: nil)
      changelog_file = find_changelog_file
      return [] unless changelog_file && File.exist?(changelog_file)
      
      entries = JSON.parse(File.read(changelog_file, encoding: 'UTF-8'))
      entries = entries.select { |e| e['version'] == version } if version
      entries.sort_by { |e| e['date'] || '' }.reverse
    end

    def self.create_entry(entry_data)
      changelog_file = find_changelog_file
      FileUtils.mkdir_p(File.dirname(changelog_file))
      
      entries = []
      if File.exist?(changelog_file)
        entries = JSON.parse(File.read(changelog_file, encoding: 'UTF-8'))
      end
      
      entry = {
        'id' => SecureRandom.uuid,
        'version' => entry_data['version'],
        'date' => entry_data['date'] || Date.today.iso8601,
        'category' => entry_data['category'],
        'title' => entry_data['title'],
        'description' => entry_data['description'],
        'links' => entry_data['links'] || []
      }
      
      entries << entry
      File.write(changelog_file, JSON.pretty_generate(entries))
      entry
    end

    def self.generate_rss
      entries = list_entries
      # Generate RSS XML
      # Implementation details...
    end

    private

    def self.find_changelog_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'changelog.json')
    end
  end
end
```

**API Endpoints:**
```ruby
# lib/elder_docs/engine/api_controller.rb
def changelog
  version = params[:version]
  entries = ElderDocs::ChangelogManager.list_entries(version: version)
  render json: entries
end

def changelog_rss
  rss = ElderDocs::ChangelogManager.generate_rss
  render xml: rss, content_type: 'application/rss+xml'
end
```

**Frontend - Changelog Component:**
```javascript
// frontend/src/components/Changelog.jsx
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const Changelog = () => {
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState('all')
  const [versionFilter, setVersionFilter] = useState('all')

  useEffect(() => {
    loadChangelog()
  }, [versionFilter])

  const loadChangelog = async () => {
    const url = versionFilter !== 'all' 
      ? `/docs/api/changelog?version=${versionFilter}`
      : '/docs/api/changelog'
    
    const response = await fetch(url)
    const data = await response.json()
    setEntries(data)
  }

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.category === filter)

  const categories = ['all', 'added', 'changed', 'fixed', 'deprecated', 'removed', 'security']

  return (
    <div className="changelog">
      <div className="changelog-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <select value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)}>
          <option value="all">All Versions</option>
          {/* Populate with versions */}
        </select>
      </div>

      <div className="changelog-timeline">
        {filteredEntries.map(entry => (
          <div key={entry.id} className={`changelog-entry category-${entry.category}`}>
            <div className="entry-header">
              <span className="version-badge">{entry.version}</span>
              <span className="category-badge">{entry.category}</span>
              <span className="date">{new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <h3>{entry.title}</h3>
            <ReactMarkdown>{entry.description}</ReactMarkdown>
            {entry.links && entry.links.length > 0 && (
              <div className="entry-links">
                {entry.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Database Changes
None - changelog stored in JSON file

### Frontend Changes
1. Create `Changelog.jsx` component
2. Add changelog route/view
3. Add filtering and search
4. Add RSS feed link
5. Integrate with version selector

### Ideas & Suggestions
1. **Auto-generate from Git:** Parse git commits/tags for changelog
2. **Email Notifications:** Notify users of important changes
3. **Breaking Changes Highlight:** Special highlighting for breaking changes
4. **Migration Guides:** Link changelog entries to migration guides
5. **Changelog Templates:** Pre-filled templates for common changes

---

## 6. Discussion Forum

### Current State
- ⚠️ No discussion feature exists

### Requirements

#### 6.1 API-Level Discussion Forum
**Features Needed:**
1. **Discussion Threads:**
   - Threads per API endpoint
   - Threads per article/guide
   - General discussions
   - Comment threading (replies)

2. **Comment Features:**
   - Markdown support
   - Code syntax highlighting
   - @mentions
   - Reactions (👍, ❤️, etc.)
   - Edit/delete own comments
   - Moderation (admin)

3. **User Management:**
   - Anonymous comments (optional)
   - User authentication (optional)
   - User profiles
   - Notification system

**Implementation:**

**Backend - Discussion Storage:**
```ruby
# lib/elder_docs/discussion_manager.rb
module ElderDocs
  class DiscussionManager
    def self.create_thread(thread_data)
      threads_file = find_threads_file
      FileUtils.mkdir_p(File.dirname(threads_file))
      
      threads = load_threads
      
      thread = {
        'id' => SecureRandom.uuid,
        'entity_type' => thread_data['entity_type'], # 'endpoint', 'article', 'general'
        'entity_id' => thread_data['entity_id'], # endpoint path, article id, etc.
        'title' => thread_data['title'],
        'created_at' => Time.now.iso8601,
        'updated_at' => Time.now.iso8601,
        'comments' => []
      }
      
      threads << thread
      save_threads(threads)
      thread
    end

    def self.add_comment(thread_id, comment_data)
      threads = load_threads
      thread = threads.find { |t| t['id'] == thread_id }
      return nil unless thread
      
      comment = {
        'id' => SecureRandom.uuid,
        'author' => comment_data['author'] || 'Anonymous',
        'author_email' => comment_data['author_email'],
        'content' => comment_data['content'],
        'created_at' => Time.now.iso8601,
        'updated_at' => Time.now.iso8601,
        'replies' => [],
        'reactions' => {}
      }
      
      thread['comments'] << comment
      thread['updated_at'] = Time.now.iso8601
      save_threads(threads)
      comment
    end

    def self.get_threads(entity_type: nil, entity_id: nil)
      threads = load_threads
      threads = threads.select { |t| t['entity_type'] == entity_type } if entity_type
      threads = threads.select { |t| t['entity_id'] == entity_id } if entity_id
      threads.sort_by { |t| t['updated_at'] || '' }.reverse
    end

    private

    def self.load_threads
      threads_file = find_threads_file
      return [] unless threads_file && File.exist?(threads_file)
      JSON.parse(File.read(threads_file, encoding: 'UTF-8'))
    end

    def self.save_threads(threads)
      threads_file = find_threads_file
      FileUtils.mkdir_p(File.dirname(threads_file))
      File.write(threads_file, JSON.pretty_generate(threads))
    end

    def self.find_threads_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'discussions.json')
    end
  end
end
```

**API Endpoints:**
```ruby
# lib/elder_docs/engine/discussions_controller.rb
module ElderDocs
  class Engine
    class DiscussionsController < ActionController::API
      def index
        threads = ElderDocs::DiscussionManager.get_threads(
          entity_type: params[:entity_type],
          entity_id: params[:entity_id]
        )
        render json: threads
      end

      def show
        threads = ElderDocs::DiscussionManager.load_threads
        thread = threads.find { |t| t['id'] == params[:id] }
        
        if thread
          render json: thread
        else
          render json: { error: 'Thread not found' }, status: :not_found
        end
      end

      def create
        thread = ElderDocs::DiscussionManager.create_thread(params[:thread])
        render json: thread, status: :created
      end

      def add_comment
        comment = ElderDocs::DiscussionManager.add_comment(
          params[:thread_id],
          params[:comment]
        )
        
        if comment
          render json: comment, status: :created
        else
          render json: { error: 'Thread not found' }, status: :not_found
        end
      end
    end
  end
end
```

**Frontend - Discussion Component:**
```javascript
// frontend/src/components/DiscussionForum.jsx
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const DiscussionForum = ({ entityType, entityId }) => {
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadThreads()
  }, [entityType, entityId])

  const loadThreads = async () => {
    const url = `/docs/api/discussions?entity_type=${entityType}&entity_id=${entityId}`
    const response = await fetch(url)
    const data = await response.json()
    setThreads(data)
  }

  const handleAddComment = async (threadId) => {
    const response = await fetch(`/docs/api/discussions/${threadId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: {
          author: 'Anonymous', // Get from auth if available
          content: newComment
        }
      })
    })
    
    if (response.ok) {
      setNewComment('')
      loadThreads()
    }
  }

  return (
    <div className="discussion-forum">
      <div className="discussion-header">
        <h2>Discussions</h2>
        <button onClick={() => setSelectedThread(null)}>New Discussion</button>
      </div>

      {selectedThread ? (
        <div className="thread-view">
          <h3>{selectedThread.title}</h3>
          {selectedThread.comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="author">{comment.author}</span>
                <span className="date">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <ReactMarkdown>{comment.content}</ReactMarkdown>
              <div className="comment-actions">
                <button>Reply</button>
                <button>👍 {comment.reactions?.like || 0}</button>
              </div>
            </div>
          ))}
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={() => handleAddComment(selectedThread.id)}>Post</button>
          </div>
        </div>
      ) : (
        <div className="threads-list">
          {threads.map(thread => (
            <div key={thread.id} className="thread-card" onClick={() => setSelectedThread(thread)}>
              <h4>{thread.title}</h4>
              <span>{thread.comments.length} comments</span>
              <span>{new Date(thread.updated_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Database Changes
None - discussions stored in JSON file (consider migration to database for production)

### Frontend Changes
1. Create `DiscussionForum.jsx` component
2. Add discussion section to endpoint/article views
3. Add markdown editor for comments
4. Add reaction system
5. Add notification system (optional)

### Ideas & Suggestions
1. **Moderation Queue:** Admin approval for comments
2. **Spam Detection:** Basic spam filtering
3. **Email Notifications:** Notify on replies
4. **Search:** Search discussions
5. **Voting:** Upvote helpful comments
6. **Mark as Resolved:** Mark discussion threads as resolved
7. **Integration with GitHub:** Link discussions to GitHub issues

---

## 7. Landing Page Customization

### Current State
- ⚠️ No customizable landing page
- ⚠️ Direct navigation to API docs

### Requirements

#### 7.1 Customizable Landing Page
**Features Needed:**
1. **HTML Customization:**
   - Custom HTML template
   - WYSIWYG editor
   - Template variables (API name, version, etc.)

2. **Landing Page Sections:**
   - Hero section
   - Features section
   - Getting started section
   - API overview
   - Call-to-action buttons

3. **Routing:**
   - Landing page at `/docs` or `/`
   - API docs at `/docs/api` or `/docs/reference`

**Implementation:**

**Backend - Landing Page Storage:**
```ruby
# lib/elder_docs/landing_page_manager.rb
module ElderDocs
  class LandingPageManager
    DEFAULT_TEMPLATE = <<~HTML
      <!DOCTYPE html>
      <html>
      <head>
        <title>{{api_name}} - API Documentation</title>
        <meta name="description" content="{{api_description}}">
      </head>
      <body>
        <header>
          <h1>{{api_name}}</h1>
          <p>{{api_description}}</p>
        </header>
        <main>
          <section class="hero">
            <h2>Welcome to {{api_name}}</h2>
            <p>Get started with our API in minutes</p>
            <a href="/docs/api">View API Documentation</a>
          </section>
        </main>
      </body>
      </html>
    HTML

    def self.get_landing_page
      landing_page_file = find_landing_page_file
      
      if landing_page_file && File.exist?(landing_page_file)
        File.read(landing_page_file, encoding: 'UTF-8')
      else
        DEFAULT_TEMPLATE
      end
    end

    def self.save_landing_page(html_content)
      landing_page_file = find_landing_page_file
      FileUtils.mkdir_p(File.dirname(landing_page_file))
      File.write(landing_page_file, html_content)
    end

    def self.render_with_variables(html_content, variables = {})
      content = html_content.dup
      variables.each do |key, value|
        content.gsub!("{{#{key}}}", value.to_s)
      end
      content
    end

    private

    def self.find_landing_page_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'landing_page.html')
    end
  end
end
```

**API Endpoint:**
```ruby
# lib/elder_docs/engine/landing_controller.rb
module ElderDocs
  class Engine
    class LandingController < ActionController::Base
      def show
        html_content = ElderDocs::LandingPageManager.get_landing_page
        variables = extract_template_variables
        rendered = ElderDocs::LandingPageManager.render_with_variables(html_content, variables)
        render html: rendered.html_safe
      end

      private

      def extract_template_variables
        definitions = load_definitions
        {
          api_name: definitions.dig('info', 'title') || 'API',
          api_description: definitions.dig('info', 'description') || '',
          api_version: definitions.dig('info', 'version') || '1.0.0'
        }
      end

      def load_definitions
        # Load definitions.json
        # Similar to api_controller.rb
      end
    end
  end
end
```

**Frontend - Landing Page Editor:**
```javascript
// frontend/src/components/LandingPageEditor.jsx
const LandingPageEditor = () => {
  const [htmlContent, setHtmlContent] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    loadLandingPage()
  }, [])

  const loadLandingPage = async () => {
    const response = await fetch('/docs/api/landing-page')
    const html = await response.text()
    setHtmlContent(html)
  }

  const saveLandingPage = async () => {
    await fetch('/docs/api/landing-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html_content: htmlContent })
    })
  }

  return (
    <div className="landing-page-editor">
      <div className="editor-toolbar">
        <button onClick={() => setPreview(!preview)}>
          {preview ? 'Edit' : 'Preview'}
        </button>
        <button onClick={saveLandingPage}>Save</button>
      </div>
      
      {preview ? (
        <iframe
          srcDoc={htmlContent}
          className="preview-frame"
        />
      ) : (
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="html-editor"
        />
      )}
    </div>
  )
}
```

**Routes:**
```ruby
# lib/elder_docs/engine.rb
get '/', to: 'engine/landing#show'
get '/api/landing-page', to: 'engine/api#landing_page'
post '/api/landing-page', to: 'engine/api#save_landing_page'
```

### Database Changes
None - landing page stored as HTML file

### Frontend Changes
1. Create landing page route
2. Create landing page editor
3. Add template variables system
4. Add WYSIWYG editor option
5. Update routing logic

### Ideas & Suggestions
1. **Template Library:** Pre-built landing page templates
2. **Component Builder:** Drag-and-drop component builder
3. **A/B Testing:** Test different landing pages
4. **Analytics Integration:** Track landing page metrics
5. **SEO Optimization:** Meta tags, Open Graph, structured data

---

## 8. Remove ElderDocs Branding

### Current State
- ⚠️ "Powered by ElderDocs" footer exists
- ⚠️ Default title includes "ElderDocs"

### Requirements

#### 8.1 White-Label Support
**Features Needed:**
1. **Remove Branding:**
   - Remove "Powered by ElderDocs" footer
   - Customizable footer text
   - Custom favicon
   - Custom page title

2. **Configuration:**
   - `show_powered_by_footer` option (already exists)
   - Custom footer HTML
   - Custom branding elements

**Implementation:**

**Backend - Configuration:**
```ruby
# lib/elder_docs/config.rb
# Already supports:
# ui_config.show_powered_by_footer

# Add:
# ui_config.custom_footer_html
# ui_config.branding_enabled (default: true for free, false for paid)
```

**Frontend Changes:**
```javascript
// frontend/src/App.jsx
// Already implemented:
const showFooter = data?.ui_config?.show_powered_by_footer !== false

// Update to:
const showFooter = data?.ui_config?.show_powered_by_footer === true
const customFooter = data?.ui_config?.custom_footer_html

// In render:
{showFooter && (
  <footer>
    {customFooter ? (
      <div dangerouslySetInnerHTML={{ __html: customFooter }} />
    ) : (
      <p>Powered by ElderDocs</p>
    )}
  </footer>
)}
```

**Configuration:**
```yaml
# elderdocs.yml
ui:
  show_powered_by_footer: false
  custom_footer_html: "<p>© 2024 My Company</p>"
  page_title: "My API Documentation"
```

### Database Changes
None

### Frontend Changes
1. Update footer logic in `App.jsx`
2. Add custom footer HTML support
3. Update default page title logic
4. Add branding toggle in UI configurator

### Ideas & Suggestions
1. **License Check:** Verify license for white-label feature
2. **Branding Package:** Optional branding package for attribution
3. **Custom Domain:** Support for custom domains

---

## 9. Export Usage Metrics

### Current State
- ⚠️ No metrics tracking
- ⚠️ No analytics

### Requirements

#### 9.1 Usage Metrics System
**Features Needed:**
1. **Metrics Collection:**
   - Page views
   - Endpoint views
   - API requests made via explorer
   - Search queries
   - Most viewed endpoints/articles

2. **Export Formats:**
   - CSV export
   - JSON export
   - PDF reports
   - Scheduled email reports

3. **Analytics Dashboard:**
   - Basic dashboard view
   - Charts and graphs
   - Date range filtering

**Implementation:**

**Backend - Metrics Collection:**
```ruby
# lib/elder_docs/metrics_collector.rb
module ElderDocs
  class MetricsCollector
    def self.track_event(event_type, event_data = {})
      metrics_file = find_metrics_file
      FileUtils.mkdir_p(File.dirname(metrics_file))
      
      metrics = load_metrics
      
      metric = {
        'id' => SecureRandom.uuid,
        'event_type' => event_type, # 'page_view', 'endpoint_view', 'api_request', 'search'
        'event_data' => event_data,
        'timestamp' => Time.now.iso8601,
        'ip_address' => event_data['ip_address'],
        'user_agent' => event_data['user_agent']
      }
      
      metrics << metric
      save_metrics(metrics)
    end

    def self.get_metrics(start_date: nil, end_date: nil, event_type: nil)
      metrics = load_metrics
      
      metrics = metrics.select { |m| m['timestamp'] >= start_date.iso8601 } if start_date
      metrics = metrics.select { |m| m['timestamp'] <= end_date.iso8601 } if end_date
      metrics = metrics.select { |m| m['event_type'] == event_type } if event_type
      
      metrics
    end

    def self.export_csv(start_date: nil, end_date: nil)
      metrics = get_metrics(start_date: start_date, end_date: end_date)
      
      CSV.generate do |csv|
        csv << ['Timestamp', 'Event Type', 'Event Data', 'IP Address', 'User Agent']
        metrics.each do |metric|
          csv << [
            metric['timestamp'],
            metric['event_type'],
            metric['event_data'].to_json,
            metric['ip_address'],
            metric['user_agent']
          ]
        end
      end
    end

    private

    def self.load_metrics
      metrics_file = find_metrics_file
      return [] unless metrics_file && File.exist?(metrics_file)
      JSON.parse(File.read(metrics_file, encoding: 'UTF-8'))
    end

    def self.save_metrics(metrics)
      metrics_file = find_metrics_file
      FileUtils.mkdir_p(File.dirname(metrics_file))
      File.write(metrics_file, JSON.pretty_generate(metrics))
    end

    def self.find_metrics_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'metrics.json')
    end
  end
end
```

**API Endpoints:**
```ruby
# lib/elder_docs/engine/metrics_controller.rb
module ElderDocs
  class Engine
    class MetricsController < ActionController::API
      before_action :authenticate_admin!

      def index
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : nil
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : nil
        event_type = params[:event_type]
        
        metrics = ElderDocs::MetricsCollector.get_metrics(
          start_date: start_date,
          end_date: end_date,
          event_type: event_type
        )
        
        render json: metrics
      end

      def export_csv
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : nil
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : nil
        
        csv = ElderDocs::MetricsCollector.export_csv(
          start_date: start_date,
          end_date: end_date
        )
        
        send_data csv, filename: "metrics-#{Date.today}.csv", type: 'text/csv'
      end

      def stats
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : 30.days.ago
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : Date.today
        
        metrics = ElderDocs::MetricsCollector.get_metrics(
          start_date: start_date,
          end_date: end_date
        )
        
        stats = {
          total_events: metrics.length,
          page_views: metrics.count { |m| m['event_type'] == 'page_view' },
          endpoint_views: metrics.count { |m| m['event_type'] == 'endpoint_view' },
          api_requests: metrics.count { |m| m['event_type'] == 'api_request' },
          top_endpoints: calculate_top_endpoints(metrics),
          top_articles: calculate_top_articles(metrics)
        }
        
        render json: stats
      end

      private

      def calculate_top_endpoints(metrics)
        endpoint_views = metrics.select { |m| m['event_type'] == 'endpoint_view' }
        endpoint_counts = endpoint_views.group_by { |m| m['event_data']['endpoint'] }
        endpoint_counts.map { |endpoint, views| { endpoint: endpoint, count: views.length } }
          .sort_by { |e| -e[:count] }
          .first(10)
      end

      def calculate_top_articles(metrics)
        article_views = metrics.select { |m| m['event_type'] == 'article_view' }
        article_counts = article_views.group_by { |m| m['event_data']['article_id'] }
        article_counts.map { |article_id, views| { article_id: article_id, count: views.length } }
          .sort_by { |a| -a[:count] }
          .first(10)
      end
    end
  end
end
```

**Frontend - Metrics Tracking:**
```javascript
// frontend/src/utils/metrics.js
export const trackEvent = (eventType, eventData = {}) => {
  fetch('/docs/api/metrics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      event_data: eventData,
      ip_address: '', // Will be set by server
      user_agent: navigator.userAgent
    })
  }).catch(err => console.error('Failed to track event:', err))
}

// Track page views
export const trackPageView = (page) => {
  trackEvent('page_view', { page })
}

// Track endpoint views
export const trackEndpointView = (endpoint, method) => {
  trackEvent('endpoint_view', { endpoint, method })
}

// Track API requests
export const trackApiRequest = (endpoint, method, status) => {
  trackEvent('api_request', { endpoint, method, status })
}
```

**Frontend - Analytics Dashboard:**
```javascript
// frontend/src/components/AnalyticsDashboard.jsx
const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null)
  const [dateRange, setDateRange] = useState({ start: null, end: null })

  useEffect(() => {
    loadStats()
  }, [dateRange])

  const loadStats = async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.append('start_date', dateRange.start)
    if (dateRange.end) params.append('end_date', dateRange.end)
    
    const response = await fetch(`/docs/api/metrics/stats?${params}`)
    const data = await response.json()
    setStats(data)
  }

  const exportMetrics = async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.append('start_date', dateRange.start)
    if (dateRange.end) params.append('end_date', dateRange.end)
    
    window.open(`/docs/api/metrics/export.csv?${params}`)
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>Usage Analytics</h2>
        <button onClick={exportMetrics}>Export CSV</button>
      </div>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Events</h3>
            <p>{stats.total_events}</p>
          </div>
          <div className="stat-card">
            <h3>Page Views</h3>
            <p>{stats.page_views}</p>
          </div>
          <div className="stat-card">
            <h3>Endpoint Views</h3>
            <p>{stats.endpoint_views}</p>
          </div>
          <div className="stat-card">
            <h3>API Requests</h3>
            <p>{stats.api_requests}</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Database Changes
None - metrics stored in JSON file (consider database for production scale)

### Frontend Changes
1. Add metrics tracking throughout app
2. Create analytics dashboard
3. Add export functionality
4. Add charts/graphs (use Chart.js or similar)
5. Add date range picker

### Ideas & Suggestions
1. **Privacy Mode:** Respect Do Not Track headers
2. **Real-time Dashboard:** WebSocket updates for live metrics
3. **Custom Events:** Allow custom event tracking
4. **Integration:** Export to Google Analytics, Mixpanel, etc.
5. **Retention Policy:** Auto-delete old metrics

---

## 10. Self-Hosted & Hosted Plans

### Current State
- ⚠️ No licensing/payment system
- ⚠️ No plan differentiation

### Requirements

#### 10.1 Licensing System
**Features Needed:**
1. **License Types:**
   - Self-hosted (lifetime $150)
   - Hosted (monthly $35)
   - Free tier (with limitations)

2. **License Management:**
   - License key validation
   - Feature gating based on license
   - License activation/deactivation

3. **Payment Integration:**
   - Stripe integration for hosted plans
   - One-time payment for self-hosted
   - License key generation

**Implementation:**

**Backend - License Manager:**
```ruby
# lib/elder_docs/license_manager.rb
module ElderDocs
  class LicenseManager
    LICENSE_TYPES = {
      'self_hosted' => { name: 'Self-Hosted', price: 150, lifetime: true },
      'hosted' => { name: 'Hosted', price: 35, lifetime: false, billing: 'monthly' },
      'free' => { name: 'Free', price: 0, lifetime: true }
    }.freeze

    def self.validate_license(license_key)
      license_file = find_license_file
      return { valid: false, type: 'free' } unless license_file && File.exist?(license_file)
      
      license_data = JSON.parse(File.read(license_file, encoding: 'UTF-8'))
      
      # Validate license key matches
      if license_data['license_key'] == license_key
        {
          valid: true,
          type: license_data['license_type'],
          expires_at: license_data['expires_at'],
          features: get_features_for_type(license_data['license_type'])
        }
      else
        { valid: false, type: 'free' }
      end
    end

    def self.activate_license(license_key, license_type)
      license_data = {
        'license_key' => license_key,
        'license_type' => license_type,
        'activated_at' => Time.now.iso8601,
        'expires_at' => license_type == 'self_hosted' ? nil : calculate_expiry(license_type)
      }
      
      license_file = find_license_file
      FileUtils.mkdir_p(File.dirname(license_file))
      File.write(license_file, JSON.pretty_generate(license_data))
      
      license_data
    end

    def self.get_features_for_type(license_type)
      case license_type
      when 'self_hosted'
        {
          white_label: true,
          custom_domain: true,
          advanced_analytics: true,
          api_versioning: true,
          discussion_forum: true,
          custom_landing_page: true,
          export_metrics: true
        }
      when 'hosted'
        {
          white_label: true,
          custom_domain: true,
          advanced_analytics: true,
          api_versioning: true,
          discussion_forum: true,
          custom_landing_page: true,
          export_metrics: true
        }
      else # free
        {
          white_label: false,
          custom_domain: false,
          advanced_analytics: false,
          api_versioning: false,
          discussion_forum: false,
          custom_landing_page: false,
          export_metrics: false
        }
      end
    end

    private

    def self.calculate_expiry(license_type)
      case license_type
      when 'hosted'
        1.month.from_now.iso8601
      else
        nil
      end
    end

    def self.find_license_file
      base_path = if defined?(Rails) && Rails.root
        Rails.root
      else
        Pathname.new(Dir.pwd)
      end
      
      File.join(base_path, 'elderdocs', 'license.json')
    end
  end
end
```

**Feature Gating:**
```ruby
# lib/elder_docs/feature_gate.rb
module ElderDocs
  class FeatureGate
    def self.enabled?(feature_name)
      license = get_current_license
      license[:features][feature_name.to_sym] == true
    end

    def self.check_feature!(feature_name)
      unless enabled?(feature_name)
        raise FeatureNotAvailableError, "Feature '#{feature_name}' is not available in your license"
      end
    end

    private

    def self.get_current_license
      license_file = find_license_file
      return { type: 'free', features: LicenseManager.get_features_for_type('free') } unless license_file && File.exist?(license_file)
      
      license_data = JSON.parse(File.read(license_file, encoding: 'UTF-8'))
      {
        type: license_data['license_type'],
        features: LicenseManager.get_features_for_type(license_data['license_type'])
      }
    end

    def self.find_license_file
      # Same as LicenseManager
    end
  end
end
```

**API Endpoints:**
```ruby
# lib/elder_docs/engine/license_controller.rb
module ElderDocs
  class Engine
    class LicenseController < ActionController::API
      def show
        license = get_current_license_info
        render json: license
      end

      def activate
        license_key = params[:license_key]
        license_type = params[:license_type]
        
        license = ElderDocs::LicenseManager.activate_license(license_key, license_type)
        render json: license
      end

      private

      def get_current_license_info
        license_file = find_license_file
        return { type: 'free', features: {} } unless license_file && File.exist?(license_file)
        
        license_data = JSON.parse(File.read(license_file, encoding: 'UTF-8'))
        {
          type: license_data['license_type'],
          features: ElderDocs::LicenseManager.get_features_for_type(license_data['license_type']),
          expires_at: license_data['expires_at']
        }
      end
    end
  end
end
```

**Frontend - License Activation:**
```javascript
// frontend/src/components/LicenseActivation.jsx
const LicenseActivation = () => {
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseType, setLicenseType] = useState('self_hosted')
  const [currentLicense, setCurrentLicense] = useState(null)

  useEffect(() => {
    loadCurrentLicense()
  }, [])

  const loadCurrentLicense = async () => {
    const response = await fetch('/docs/api/license')
    const data = await response.json()
    setCurrentLicense(data)
  }

  const activateLicense = async () => {
    const response = await fetch('/docs/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        license_type: licenseType
      })
    })
    
    if (response.ok) {
      await loadCurrentLicense()
    }
  }

  return (
    <div className="license-activation">
      <h2>License Activation</h2>
      {currentLicense && (
        <div className="current-license">
          <p>Type: {currentLicense.type}</p>
          <p>Features: {Object.keys(currentLicense.features).join(', ')}</p>
        </div>
      )}
      <div className="activation-form">
        <select value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
          <option value="self_hosted">Self-Hosted ($150 lifetime)</option>
          <option value="hosted">Hosted ($35/month)</option>
        </select>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Enter license key"
        />
        <button onClick={activateLicense}>Activate</button>
      </div>
    </div>
  )
}
```

### Database Changes
None - license stored in JSON file

### Frontend Changes
1. Add license activation UI
2. Add feature gating checks throughout app
3. Show upgrade prompts for locked features
4. Add license status indicator

### Ideas & Suggestions
1. **Payment Integration:** Stripe checkout for license purchase
2. **License Server:** Centralized license validation server
3. **Trial Period:** Free trial for paid features
4. **Usage Limits:** Limit features based on usage (e.g., API requests per month)
5. **Team Licenses:** Multi-user licenses
6. **License Transfer:** Transfer licenses between installations

---

## Implementation Priority

### Phase 1 (Core Features)
1. API Runner Enhancements (cURL + languages)
2. Markdown Editor for Guides
3. Remove ElderDocs Branding

### Phase 2 (Advanced Features)
4. API Versioning
5. Customizable Themes (enhanced)
6. Changelog Feature

### Phase 3 (Community Features)
7. Discussion Forum
8. Landing Page Customization

### Phase 4 (Business Features)
9. Export Usage Metrics
10. Self-Hosted & Hosted Plans

---

## Technical Considerations

### File Storage vs Database
- Current implementation uses JSON files for simplicity
- Consider migrating to database (PostgreSQL) for:
  - Discussion forum (better performance)
  - Metrics (better querying)
  - Multi-user scenarios

### Performance
- Cache compiled data.js
- Implement CDN for static assets
- Optimize metrics collection (async, batch processing)

### Security
- Admin authentication for all admin endpoints
- Rate limiting for API endpoints
- Input validation and sanitization
- XSS prevention in user-generated content

### Scalability
- File-based storage works for small-medium scale
- Consider database migration for large-scale deployments
- Implement caching strategies
- Background job processing for heavy operations

---

## Conclusion

This document provides a comprehensive technical specification for all planned features. Each feature includes:
- Current state analysis
- Detailed requirements
- Implementation approach
- Code examples
- Database/file structure changes
- Frontend changes needed
- Ideas and suggestions

The implementation can be done incrementally, starting with Phase 1 features and progressing through the phases based on priority and user feedback.

