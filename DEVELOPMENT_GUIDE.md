# ElderDocs Development Guide

This guide provides a step-by-step approach to building features, testing changes, and maintaining code quality.

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Development Workflow](#development-workflow)
3. [Testing Strategy](#testing-strategy)
4. [Code Organization](#code-organization)
5. [Feature Implementation Steps](#feature-implementation-steps)
6. [Hot Reloading Setup](#hot-reloading-setup)
7. [Best Practices](#best-practices)

---

## Development Environment Setup

### Prerequisites

- Ruby 3.0+ (check with `ruby -v`)
- Node.js 18+ and npm (check with `node -v` and `npm -v`)
- Bundler gem (`gem install bundler`)
- Git

### Initial Setup

```bash
# 1. Clone/navigate to the repository
cd elderdocs

# 2. Install Ruby dependencies
bundle install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Set up test app
cd test_app
bundle install
cd ..

# 5. Generate initial documentation
bundle exec elderdocs deploy
```

### Quick Start Development Server

```bash
# Option 1: Use the test script
./bin/test

# Option 2: Manual start
cd test_app
bundle exec rails server -p 3000
```

Visit `http://localhost:3000/docs` to see ElderDocs.

---

## Development Workflow

### Recommended Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/api-runner-enhancements
   ```

2. **Start development servers** (see Hot Reloading Setup below)

3. **Make changes** to backend (Ruby) or frontend (React)

4. **Test immediately** in browser at `http://localhost:3000/docs`

5. **Commit incrementally**
   ```bash
   git add .
   git commit -m "feat: add cURL format options to API runner"
   ```

6. **Test thoroughly** before merging

### File Structure Overview

```
elderdocs/
├── lib/elder_docs/          # Ruby backend code
│   ├── cli.rb               # CLI commands
│   ├── generator.rb         # Build generator
│   ├── config.rb            # Configuration
│   ├── engine/              # Rails Engine
│   │   ├── api_controller.rb
│   │   └── ui_config_controller.rb
│   └── [new managers]/      # Feature-specific managers
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Utility functions
│   └── package.json
├── test_app/                # Test Rails app
│   ├── definitions.json     # Test API definitions
│   ├── articles.json        # Test articles
│   └── config/
└── examples/                # Example files
```

---

## Testing Strategy

### Immediate UI Testing

**Goal:** See changes instantly without manual rebuilds

#### Backend Changes (Ruby)

1. **Rails auto-reloads** - Changes to Ruby files in `lib/elder_docs/` are automatically reloaded
2. **Restart server** if needed:
   ```bash
   # In test_app directory
   bundle exec rails server -p 3000
   ```

#### Frontend Changes (React)

**Option 1: Vite Dev Server (Recommended for active development)**

```bash
# Terminal 1: Start Rails server
cd test_app
bundle exec rails server -p 3000

# Terminal 2: Start Vite dev server
cd frontend
npm run dev
```

Then access via Vite's dev server URL (usually `http://localhost:5173`)

**Option 2: Auto-rebuild on changes**

```bash
# Watch for changes and rebuild
cd frontend
npm run build -- --watch
```

Then refresh browser at `http://localhost:3000/docs`

### Test Data

**Location:** `test_app/definitions.json` and `test_app/articles.json`

**Update test data** to match your feature:
```bash
# Edit test files
vim test_app/definitions.json
vim test_app/articles.json

# Regenerate docs (if needed)
cd test_app
bundle exec elderdocs deploy
```

### Manual Testing Checklist

For each feature:

- [ ] Test happy path (normal usage)
- [ ] Test edge cases (empty data, invalid input)
- [ ] Test error handling
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify no console errors
- [ ] Check network requests in DevTools

---

## Code Organization

### Backend Structure

```
lib/elder_docs/
├── cli.rb                    # CLI commands (Thor)
├── generator.rb              # Build orchestration
├── config.rb                 # Configuration management
├── version.rb                # Version constant
│
├── engine/                   # Rails Engine
│   ├── engine.rb            # Engine definition & routes
│   ├── api_controller.rb     # API endpoints
│   ├── ui_config_controller.rb
│   └── [feature]_controller.rb  # New feature controllers
│
├── managers/                 # Feature managers (NEW)
│   ├── version_manager.rb
│   ├── theme_manager.rb
│   ├── changelog_manager.rb
│   ├── discussion_manager.rb
│   ├── metrics_collector.rb
│   └── license_manager.rb
│
└── code_generators/          # Code generation (NEW)
    ├── code_generator.rb     # Base generator
    └── javascript.rb         # Language-specific generators
    └── python.rb
    └── ruby.rb
    # ... more languages
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── ApiExplorer.jsx      # API runner
│   ├── ContentPanel.jsx     # Content display
│   ├── Sidebar.jsx          # Navigation
│   ├── UiConfigurator.jsx   # Theme editor
│   │
│   ├── features/            # Feature-specific components (NEW)
│   │   ├── CodeGenerator.jsx
│   │   ├── MarkdownEditor.jsx
│   │   ├── VersionSelector.jsx
│   │   ├── Changelog.jsx
│   │   ├── DiscussionForum.jsx
│   │   ├── LandingPageEditor.jsx
│   │   └── AnalyticsDashboard.jsx
│   │
│   └── shared/              # Shared components (NEW)
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
│
├── contexts/
│   └── ApiKeyContext.jsx
│
├── utils/                   # Utility functions (NEW)
│   ├── metrics.js           # Metrics tracking
│   ├── api.js               # API helpers
│   └── formatting.js        # Format helpers
│
├── hooks/                   # Custom hooks (NEW)
│   ├── useApiData.js
│   ├── useVersion.js
│   └── useLicense.js
│
└── App.jsx                  # Main app component
```

### Naming Conventions

**Ruby:**
- Classes: `PascalCase` (e.g., `VersionManager`)
- Methods: `snake_case` (e.g., `get_version`)
- Files: `snake_case.rb` (e.g., `version_manager.rb`)

**JavaScript/React:**
- Components: `PascalCase.jsx` (e.g., `CodeGenerator.jsx`)
- Hooks: `camelCase` starting with `use` (e.g., `useApiData`)
- Utilities: `camelCase.js` (e.g., `formatCurl.js`)

---

## Feature Implementation Steps

### Step-by-Step Process

For each feature from `FEATURES_TECHNICAL_SPEC.md`:

#### Phase 1: Planning
1. Read the feature spec thoroughly
2. Identify dependencies (other features, libraries)
3. List all files that need to be created/modified
4. Create a checklist

#### Phase 2: Backend Implementation
1. Create manager class (if needed) in `lib/elder_docs/managers/`
2. Create controller (if needed) in `lib/elder_docs/engine/`
3. Add routes in `lib/elder_docs/engine.rb`
4. Test endpoints with `curl` or Postman

#### Phase 3: Frontend Implementation
1. Create component in `frontend/src/components/features/`
2. Add necessary utilities/hooks
3. Integrate into `App.jsx` or parent component
4. Style with Tailwind CSS

#### Phase 4: Integration
1. Connect frontend to backend API
2. Test end-to-end flow
3. Handle error cases
4. Add loading states

#### Phase 5: Polish
1. Add error handling
2. Improve UX (loading states, animations)
3. Add accessibility features
4. Write documentation

---

## Hot Reloading Setup

### Option 1: Vite Dev Server (Best for Frontend Development)

**Setup:**

1. **Configure Vite to proxy API requests:**

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/docs/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

2. **Start both servers:**

```bash
# Terminal 1: Rails server
cd test_app
bundle exec rails server -p 3000

# Terminal 2: Vite dev server
cd frontend
npm run dev
```

3. **Access via:** `http://localhost:5173`

**Benefits:**
- Instant hot module replacement (HMR)
- Fast refresh for React components
- See changes immediately

**Note:** You'll need to update the test app to load from Vite dev server, or use a proxy setup.

### Option 2: Watch Mode (Simpler, but slower)

```bash
# Terminal 1: Rails server
cd test_app
bundle exec rails server -p 3000

# Terminal 2: Watch mode
cd frontend
npm run build -- --watch
```

Then refresh browser manually at `http://localhost:3000/docs`

### Option 3: Manual Rebuild (For production testing)

```bash
# After making changes
cd frontend
npm run build

# Then rebuild docs
cd ../test_app
bundle exec elderdocs deploy
```

---

## Feature-by-Feature Implementation Guide

### Feature 1: API Runner Enhancements (cURL + Languages)

**Estimated Time:** 2-3 days

#### Step 1: Enhanced cURL Support

**Files to modify:**
- `frontend/src/components/ApiExplorer.jsx`

**Tasks:**
1. Add `curlFormat` state (multiline, single, escaped, powershell)
2. Enhance `generateCurl()` function with format options
3. Add format selector dropdown
4. Add download buttons (.sh, .ps1)
5. Test each format

**Testing:**
- Generate cURL in each format
- Copy to clipboard
- Download scripts
- Test scripts in terminal

#### Step 2: Language Code Generation

**Files to create:**
- `lib/elder_docs/code_generator.rb`
- `lib/elder_docs/code_generators/javascript.rb`
- `lib/elder_docs/code_generators/python.rb`
- `lib/elder_docs/code_generators/ruby.rb`
- (Add more languages incrementally)

**Files to modify:**
- `lib/elder_docs/engine/api_controller.rb` (add `generate_code` endpoint)
- `lib/elder_docs/engine.rb` (add route)
- `frontend/src/components/ApiExplorer.jsx` (add code generator UI)

**Tasks:**
1. Create base `CodeGenerator` class
2. Implement JavaScript generator (fetch, axios)
3. Implement Python generator (requests)
4. Add API endpoint
5. Create frontend component
6. Integrate into ApiExplorer

**Testing:**
- Generate code for each language/variant
- Copy generated code
- Test code in actual projects
- Verify authentication headers are correct

---

### Feature 2: Markdown Editor for Guides

**Estimated Time:** 3-4 days

#### Step 1: Backend API

**Files to create:**
- `lib/elder_docs/engine/articles_controller.rb`

**Files to modify:**
- `lib/elder_docs/engine.rb` (add routes)

**Tasks:**
1. Create ArticlesController with CRUD operations
2. Add authentication (reuse UI config auth)
3. Add routes
4. Test with curl/Postman

#### Step 2: Frontend Editor

**Files to create:**
- `frontend/src/components/features/MarkdownEditor.jsx`
- `frontend/src/components/features/ArticleManager.jsx`

**Dependencies to add:**
```bash
cd frontend
npm install react-markdown remark-gfm react-syntax-highlighter
```

**Tasks:**
1. Create MarkdownEditor component
2. Add split view (edit/preview)
3. Add article list view
4. Add create/edit/delete functionality
5. Add drag-and-drop reordering
6. Style with Tailwind

**Testing:**
- Create new article
- Edit existing article
- Delete article
- Reorder articles
- Preview markdown rendering
- Test with various markdown features

---

### Feature 3: API Versioning

**Estimated Time:** 4-5 days

#### Step 1: Version Manager

**Files to create:**
- `lib/elder_docs/managers/version_manager.rb`

**Tasks:**
1. Create VersionManager class
2. Implement version CRUD operations
3. Handle version directory structure
4. Test file operations

#### Step 2: Backend API

**Files to modify:**
- `lib/elder_docs/engine/api_controller.rb` (add version support)
- `lib/elder_docs/engine.rb` (add versioned routes)

**Tasks:**
1. Update `definitions` and `articles` endpoints to accept version param
2. Add `versions` endpoint
3. Add versioned routes (`/v:version/api/...`)
4. Test version switching

#### Step 3: Frontend

**Files to create:**
- `frontend/src/components/features/VersionSelector.jsx`
- `frontend/src/hooks/useVersion.js`

**Files to modify:**
- `frontend/src/App.jsx` (add version support)

**Tasks:**
1. Create VersionSelector component
2. Add version context/hook
3. Update App.jsx to load versioned data
4. Update URL handling for versions
5. Add deprecation warnings

**Testing:**
- Create multiple versions
- Switch between versions
- Verify data isolation
- Test URL routing
- Test deprecation warnings

---

## Best Practices

### Code Quality

1. **Follow Rails conventions** for Ruby code
2. **Use ESLint/Prettier** for JavaScript (add if not present)
3. **Write descriptive commit messages:**
   ```
   feat: add cURL format options to API runner
   fix: resolve markdown editor preview issue
   refactor: extract code generation logic
   ```

### Git Workflow

1. **Feature branches:** `feature/feature-name`
2. **Small, focused commits**
3. **Test before committing**
4. **Write clear commit messages**

### Testing Checklist (Before Merging)

- [ ] Feature works as expected
- [ ] No console errors
- [ ] No breaking changes to existing features
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)
- [ ] Tested in multiple browsers
- [ ] Responsive design works

### Performance

- **Lazy load** heavy components
- **Debounce** API calls where appropriate
- **Cache** expensive computations
- **Optimize** bundle size (check with `npm run build -- --analyze`)

### Security

- **Validate** all user input
- **Sanitize** markdown/HTML content
- **Authenticate** admin endpoints
- **Rate limit** API endpoints (future)

---

## Development Scripts

### Recommended npm scripts (add to `frontend/package.json`):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:watch": "vite build --watch",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

### Recommended Rake tasks (create `Rakefile`):

```ruby
namespace :elderdocs do
  desc "Run development servers"
  task :dev do
    puts "Starting development servers..."
    # Start Rails and Vite
  end

  desc "Run tests"
  task :test do
    # Run test suite
  end

  desc "Build for production"
  task :build do
    system "cd frontend && npm run build"
    system "bundle exec elderdocs deploy"
  end
end
```

---

## Troubleshooting

### Frontend changes not showing

1. **Check if Vite dev server is running**
2. **Clear browser cache** (Cmd+Shift+R / Ctrl+Shift+R)
3. **Check browser console** for errors
4. **Rebuild manually:** `cd frontend && npm run build`

### Backend changes not working

1. **Restart Rails server**
2. **Check Rails logs** (`test_app/log/development.log`)
3. **Verify routes:** `cd test_app && bundle exec rails routes | grep docs`

### Port conflicts

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
bundle exec rails server -p 3001
```

---

## Next Steps

1. **Set up hot reloading** (choose Option 1 or 2)
2. **Start with Feature 1** (API Runner Enhancements)
3. **Test incrementally** - don't wait until everything is done
4. **Commit often** - small, focused commits
5. **Ask for help** - if stuck, document the issue

---

## Quick Reference

### Start Development

```bash
# Terminal 1: Rails
cd test_app && bundle exec rails server -p 3000

# Terminal 2: Vite (if using)
cd frontend && npm run dev

# Or: Watch mode
cd frontend && npm run build -- --watch
```

### Access Points

- **ElderDocs:** http://localhost:3000/docs
- **Vite Dev:** http://localhost:5173 (if using)
- **Rails Console:** `cd test_app && bundle exec rails console`

### Useful Commands

```bash
# Rebuild docs
cd test_app && bundle exec elderdocs deploy

# Check routes
cd test_app && bundle exec rails routes | grep docs

# Install new npm package
cd frontend && npm install package-name

# Install new gem
bundle add gem-name
```

---

Happy coding! 🚀

