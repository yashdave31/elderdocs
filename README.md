# ElderDocs

Interactive API documentation for Rails. Convert your OpenAPI spec into a beautiful, testable documentation site.

## Features

- 🚀 **Interactive API Explorer** - Test endpoints directly from docs
- 🎨 **Customizable UI** - Configure via `elderdocs.yml`
- 📖 **Guides & Articles** - Add custom documentation
- 🔐 **Multiple Auth Types** - Bearer, API Key, Basic, OAuth2
- ⚡ **Zero Compilation** - Edit JSON files, changes appear instantly!
- 📋 **Copy cURL** - One-click copy of API requests

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

### 3. Build frontend (one-time setup)

```bash
bundle exec elderdocs deploy
```

This builds the frontend SPA into `public/elderdocs` (configurable via `output_path`).

**Note:** This is a one-time build. After this, you can edit `definitions.json` and `articles.json` - changes appear instantly without rebuilding!

### 4. Mount in routes

```ruby
# config/routes.rb
mount ElderDocs::Engine, at: '/docs'
```

### 5. Visit

Open `http://localhost:3000/docs` 🎉

## Dynamic Updates

**No compilation needed!** After the initial build:

- ✏️ Edit `definitions.json` → Changes appear immediately
- ✏️ Edit `articles.json` → Changes appear immediately  
- ✏️ Edit `elderdocs.yml` → Restart Rails server to see UI changes

The frontend fetches data dynamically from your JSON files at runtime.

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

# UI customization
ui:
  font_heading: 'Syne'
  font_body: 'IBM Plex Sans'
  colors:
    primary: '#f8d447'
    secondary: '#000000'
    background: '#ffffff'
    surface: '#ffffff'
  corner_radius: '0px'

# Custom file paths (optional, defaults to definitions.json and articles.json)
definitions_file: definitions.json
articles_file: articles.json

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

## Development

### Quick Development Build

For rapid iteration during development:

```bash
./dev_build.sh
# or
rake elderdocs:dev
```

This rebuilds and reinstalls the gem locally without publishing.

### Full Build and Deploy

To build, test, and optionally publish a new version:

```bash
./build_and_deploy.sh
# or
rake elderdocs:deploy
```

Options:
- `--skip-publish` - Build and test but don't publish to RubyGems
- `--skip-tests` - Skip running tests

### Manual Build

```bash
# Build gem
rake elderdocs:build
# or
gem build elder_docs.gemspec

# Install locally
gem install elder_docs-*.gem --local

# Publish (when ready)
gem push elder_docs-*.gem
```

## License

MIT
