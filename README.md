# ElderDocs

Interactive API documentation for Rails. Convert your OpenAPI spec into a beautiful, testable documentation site.

## Features

- 🚀 **Interactive API Explorer** - Test endpoints directly from docs
- 🎨 **Customizable UI** - Web-based configurator at `/docs/ui`
- 📖 **Guides & Articles** - Add custom documentation
- 🔐 **Multiple Auth Types** - Bearer, API Key, Basic, OAuth2
- ⚡ **Zero Config** - Works out of the box

## Installation

Add to your `Gemfile`:

```ruby
gem 'elder_docs'
```

Then:

```bash
bundle install
```

## Quick Start

### 1. Create your OpenAPI file

Create `definitions.json` in your Rails root:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "servers": [{"url": "https://api.example.com"}],
  "paths": {
    "/users": {
      "get": {
        "summary": "List users",
        "responses": {
          "200": {"description": "Success"}
        }
      }
    }
  }
}
```

### 2. Create articles (optional)

Create `articles.json`:

```json
[
  {
    "id": "getting_started",
    "title": "Getting Started",
    "markdown_content": "## Welcome\n\nYour guide here..."
  }
]
```

### 3. Generate docs

```bash
bundle exec elderdocs deploy
```

This builds the SPA into `public/elderdocs` (configurable via `output_path`) so the assets live alongside your application code.
### 4. Mount in routes

```ruby
# config/routes.rb
mount ElderDocs::Engine, at: '/docs'
```

### 5. Visit

Open `http://localhost:3000/docs` 🎉

## Customize UI

Visit `/docs/ui` to customize fonts, colors, and styling with a visual editor.

**Default password:** `admin` (or set `admin_password` in `elderdocs.yml`)

## Configuration

Create `elderdocs.yml` in your Rails root:

```yaml
# API server URL
api_server: https://api.example.com

# Multiple environments
api_servers:
  - url: https://api-sandbox.example.com
    description: Sandbox
  - url: https://api.example.com
    description: Production

# Authentication types
auth_types:
  - bearer
  - api_key
  - basic
  - oauth2

# UI customization (or use /docs/ui)
ui:
  font_heading: 'Syne'
  font_body: 'IBM Plex Sans'
  colors:
    primary: '#f8d447'
    secondary: '#000000'
    background: '#ffffff'
    surface: '#ffffff'
  corner_radius: '0px'

# Admin password for /docs/ui
admin_password: your-secure-password

# Where to write generated assets (relative paths are resolved from Rails.root)
output_path: ./public/elderdocs
```

## CLI Options

```bash
bundle exec elderdocs deploy \
  --definitions custom.json \
  --articles guides.json \
  --api-server https://api.example.com \
  --output public/custom-docs
```

## Requirements

- Ruby >= 2.7.0
- Rails >= 6.0
- Node.js >= 16.0 (for building assets)

## License

MIT
