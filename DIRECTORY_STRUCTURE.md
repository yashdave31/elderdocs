# ElderDocs Directory Structure

This document explains the directory structure and where to add new code.

## Root Directory

```
elderdocs/
├── bin/                    # Executable scripts
│   └── test               # Test runner script
├── examples/              # Example JSON files
├── frontend/              # React frontend application
├── lib/                   # Ruby gem code
├── scripts/               # Development scripts (NEW)
│   └── dev.sh            # Development server script
├── test_app/              # Test Rails application
├── tools/                 # Utility scripts
└── vendor/                # Bundled dependencies
```

## Backend Structure (`lib/elder_docs/`)

```
lib/elder_docs/
├── cli.rb                 # CLI commands (Thor)
├── config.rb              # Configuration management
├── generator.rb           # Build orchestration
├── version.rb             # Version constant
│
├── assets/                 # Static assets (fallback viewer)
│   └── viewer/
│       └── index.html
│
├── engine/                 # Rails Engine
│   ├── engine.rb          # Engine definition & routes
│   ├── api_controller.rb  # Main API endpoints
│   └── ui_config_controller.rb  # UI configuration endpoints
│
├── managers/              # Feature managers (CREATE THIS)
│   ├── version_manager.rb
│   ├── theme_manager.rb
│   ├── changelog_manager.rb
│   ├── discussion_manager.rb
│   ├── metrics_collector.rb
│   └── license_manager.rb
│
└── code_generators/       # Code generation (CREATE THIS)
    ├── code_generator.rb  # Base generator
    ├── javascript.rb
    ├── python.rb
    ├── ruby.rb
    └── [more languages].rb
```

### Where to Add New Backend Code

**New Feature Manager:**
- Create: `lib/elder_docs/managers/[feature]_manager.rb`
- Example: `lib/elder_docs/managers/version_manager.rb`

**New Controller:**
- Create: `lib/elder_docs/engine/[feature]_controller.rb`
- Add routes in: `lib/elder_docs/engine.rb`

**New Code Generator:**
- Create: `lib/elder_docs/code_generators/[language].rb`
- Register in: `lib/elder_docs/code_generator.rb`

## Frontend Structure (`frontend/src/`)

```
frontend/src/
├── App.jsx                # Main app component
├── main.jsx              # Entry point
├── index.css             # Global styles
│
├── components/
│   ├── ApiExplorer.jsx   # API runner (existing)
│   ├── ContentPanel.jsx  # Content display (existing)
│   ├── Sidebar.jsx       # Navigation (existing)
│   ├── UiConfigurator.jsx # Theme editor (existing)
│   │
│   ├── features/         # Feature components (CREATE THIS)
│   │   ├── CodeGenerator.jsx
│   │   ├── MarkdownEditor.jsx
│   │   ├── VersionSelector.jsx
│   │   ├── Changelog.jsx
│   │   ├── DiscussionForum.jsx
│   │   ├── LandingPageEditor.jsx
│   │   └── AnalyticsDashboard.jsx
│   │
│   └── shared/          # Shared components (CREATE THIS)
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
│
├── contexts/             # React contexts
│   └── ApiKeyContext.jsx
│
├── hooks/                # Custom hooks (CREATE THIS)
│   ├── useApiData.js
│   ├── useVersion.js
│   ├── useLicense.js
│   └── useMetrics.js
│
└── utils/                # Utility functions (CREATE THIS)
    ├── metrics.js        # Metrics tracking
    ├── api.js            # API helpers
    ├── formatting.js     # Format helpers
    └── validation.js    # Validation helpers
```

### Where to Add New Frontend Code

**New Feature Component:**
- Create: `frontend/src/components/features/[Feature].jsx`
- Import in: `frontend/src/App.jsx` or parent component

**New Shared Component:**
- Create: `frontend/src/components/shared/[Component].jsx`
- Use across multiple features

**New Hook:**
- Create: `frontend/src/hooks/use[HookName].js`
- Export and use in components

**New Utility:**
- Create: `frontend/src/utils/[utility].js`
- Import where needed

## Test App Structure (`test_app/`)

```
test_app/
├── app/
│   └── controllers/
│       └── application_controller.rb
├── config/
│   ├── routes.rb         # Mount ElderDocs engine here
│   └── application.rb
├── definitions.json      # Test API definitions
├── articles.json         # Test articles
└── elderdocs.yml         # Test configuration (optional)
```

### Test Data Files

**Update test data:**
- `test_app/definitions.json` - OpenAPI definitions
- `test_app/articles.json` - Markdown articles

**Configuration:**
- `test_app/elderdocs.yml` - ElderDocs configuration

## File Naming Conventions

### Ruby Files
- **Classes:** `PascalCase` → `VersionManager`
- **Files:** `snake_case.rb` → `version_manager.rb`
- **Modules:** `PascalCase` → `ElderDocs::Managers`

### JavaScript/React Files
- **Components:** `PascalCase.jsx` → `CodeGenerator.jsx`
- **Hooks:** `camelCase.js` starting with `use` → `useApiData.js`
- **Utilities:** `camelCase.js` → `formatCurl.js`
- **Constants:** `UPPER_SNAKE_CASE.js` → `API_ENDPOINTS.js`

## Creating New Directories

When adding a new feature that needs a new directory:

1. **Backend:**
   ```bash
   mkdir -p lib/elder_docs/managers
   touch lib/elder_docs/managers/.gitkeep
   ```

2. **Frontend:**
   ```bash
   mkdir -p frontend/src/components/features
   mkdir -p frontend/src/hooks
   mkdir -p frontend/src/utils
   ```

## Import/Require Patterns

### Ruby (Backend)

```ruby
# In lib/elder_docs.rb or engine.rb
require 'elder_docs/managers/version_manager'
require 'elder_docs/code_generators/javascript'
```

### JavaScript (Frontend)

```javascript
// Relative imports for components
import CodeGenerator from './features/CodeGenerator'
import { useApiData } from '../hooks/useApiData'
import { formatCurl } from '../utils/formatting'
```

## Best Practices

1. **Keep related code together** - Feature components in `features/`, shared in `shared/`
2. **Use consistent naming** - Follow conventions above
3. **Create directories before needed** - Better to have empty dirs than scattered files
4. **Document complex structures** - Add comments explaining organization
5. **Keep files focused** - One class/component per file

## Quick Reference

**Where do I...**

- **Add a new API endpoint?**
  → `lib/elder_docs/engine/api_controller.rb` or create new controller

- **Add a new React component?**
  → `frontend/src/components/features/[Feature].jsx`

- **Add a new manager/service?**
  → `lib/elder_docs/managers/[feature]_manager.rb`

- **Add a new route?**
  → `lib/elder_docs/engine.rb` (routes block)

- **Add a new utility function?**
  → `frontend/src/utils/[utility].js`

- **Add a new hook?**
  → `frontend/src/hooks/use[HookName].js`

- **Update test data?**
  → `test_app/definitions.json` or `test_app/articles.json`

