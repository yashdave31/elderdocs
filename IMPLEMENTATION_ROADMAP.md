# Implementation Roadmap

This document provides a step-by-step roadmap for implementing all features, prioritized by value and dependencies.

## Phase 1: Core Features (Week 1-2)

### Feature 1: API Runner Enhancements ⭐ START HERE

**Priority:** High  
**Dependencies:** None  
**Estimated Time:** 2-3 days

#### Step 1.1: Enhanced cURL Support (Day 1)
- [ ] Add cURL format options (multiline, single, escaped, powershell)
- [ ] Add format selector dropdown
- [ ] Add download buttons (.sh, .ps1)
- [ ] Test each format

**Files:**
- `frontend/src/components/ApiExplorer.jsx`

**Testing:**
- Generate cURL in each format
- Copy to clipboard
- Download and test scripts

#### Step 1.2: Language Code Generation - Backend (Day 2)
- [ ] Create `lib/elder_docs/code_generator.rb`
- [ ] Create `lib/elder_docs/code_generators/javascript.rb`
- [ ] Create `lib/elder_docs/code_generators/python.rb`
- [ ] Add API endpoint `/api/generate-code`
- [ ] Test with curl/Postman

**Files:**
- `lib/elder_docs/code_generator.rb` (NEW)
- `lib/elder_docs/code_generators/javascript.rb` (NEW)
- `lib/elder_docs/code_generators/python.rb` (NEW)
- `lib/elder_docs/engine/api_controller.rb` (MODIFY)
- `lib/elder_docs/engine.rb` (MODIFY - add route)

#### Step 1.3: Language Code Generation - Frontend (Day 3)
- [ ] Create `frontend/src/components/features/CodeGenerator.jsx`
- [ ] Add language selector
- [ ] Add variant selector
- [ ] Integrate into ApiExplorer
- [ ] Add syntax highlighting
- [ ] Add copy button

**Files:**
- `frontend/src/components/features/CodeGenerator.jsx` (NEW)
- `frontend/src/components/ApiExplorer.jsx` (MODIFY)

**Dependencies to install:**
```bash
cd frontend
npm install remark-gfm  # Already added
```

---

### Feature 2: Remove ElderDocs Branding

**Priority:** High  
**Dependencies:** None  
**Estimated Time:** 1 day

#### Step 2.1: Update Footer Logic
- [ ] Update `App.jsx` footer logic
- [ ] Add custom footer HTML support
- [ ] Update UI configurator
- [ ] Test white-label mode

**Files:**
- `frontend/src/App.jsx` (MODIFY)
- `frontend/src/components/UiConfigurator.jsx` (MODIFY)
- `lib/elder_docs/config.rb` (MODIFY - add config options)

---

### Feature 3: Markdown Editor for Guides

**Priority:** High  
**Dependencies:** None  
**Estimated Time:** 3-4 days

#### Step 3.1: Backend API (Day 1)
- [ ] Create `lib/elder_docs/engine/articles_controller.rb`
- [ ] Implement CRUD operations
- [ ] Add authentication
- [ ] Add routes
- [ ] Test endpoints

**Files:**
- `lib/elder_docs/engine/articles_controller.rb` (NEW)
- `lib/elder_docs/engine.rb` (MODIFY - add routes)

#### Step 3.2: Frontend Editor (Day 2-3)
- [ ] Create `MarkdownEditor.jsx`
- [ ] Add split view (edit/preview)
- [ ] Add article list view
- [ ] Add create/edit/delete
- [ ] Add drag-and-drop reordering

**Files:**
- `frontend/src/components/features/MarkdownEditor.jsx` (NEW)
- `frontend/src/components/features/ArticleManager.jsx` (NEW)

#### Step 3.3: Integration (Day 4)
- [ ] Integrate into admin UI
- [ ] Add image upload
- [ ] Polish UX
- [ ] Test thoroughly

---

## Phase 2: Advanced Features (Week 3-4)

### Feature 4: API Versioning

**Priority:** Medium  
**Dependencies:** None  
**Estimated Time:** 4-5 days

#### Step 4.1: Version Manager (Day 1-2)
- [ ] Create `lib/elder_docs/managers/version_manager.rb`
- [ ] Implement version CRUD
- [ ] Handle directory structure
- [ ] Test file operations

#### Step 4.2: Backend API (Day 2-3)
- [ ] Update `api_controller.rb` for version support
- [ ] Add versioned routes
- [ ] Add versions endpoint
- [ ] Test version switching

#### Step 4.3: Frontend (Day 3-5)
- [ ] Create `VersionSelector.jsx`
- [ ] Create `useVersion.js` hook
- [ ] Update `App.jsx` for version support
- [ ] Add deprecation warnings
- [ ] Test version switching

---

### Feature 5: Enhanced Themes

**Priority:** Medium  
**Dependencies:** Feature 2 (Remove Branding)  
**Estimated Time:** 2-3 days

#### Step 5.1: Theme Manager
- [ ] Create `lib/elder_docs/managers/theme_manager.rb`
- [ ] Add theme presets
- [ ] Implement theme CRUD
- [ ] Add API endpoints

#### Step 5.2: Frontend Theme Editor
- [ ] Enhance `UiConfigurator.jsx`
- [ ] Add theme presets UI
- [ ] Add custom CSS editor
- [ ] Add theme import/export

---

### Feature 6: Changelog

**Priority:** Medium  
**Dependencies:** Feature 4 (Versioning)  
**Estimated Time:** 2-3 days

#### Step 6.1: Changelog Manager
- [ ] Create `lib/elder_docs/managers/changelog_manager.rb`
- [ ] Implement CRUD operations
- [ ] Add RSS generation
- [ ] Add API endpoints

#### Step 6.2: Frontend
- [ ] Create `Changelog.jsx` component
- [ ] Add filtering/search
- [ ] Add RSS feed link
- [ ] Integrate with version selector

---

## Phase 3: Community Features (Week 5-6)

### Feature 7: Discussion Forum

**Priority:** Low  
**Dependencies:** None  
**Estimated Time:** 5-6 days

#### Step 7.1: Discussion Manager
- [ ] Create `lib/elder_docs/managers/discussion_manager.rb`
- [ ] Implement thread/comment CRUD
- [ ] Add moderation features
- [ ] Add API endpoints

#### Step 7.2: Frontend
- [ ] Create `DiscussionForum.jsx`
- [ ] Add markdown editor for comments
- [ ] Add reaction system
- [ ] Add notification system
- [ ] Integrate into endpoint/article views

---

### Feature 8: Landing Page Customization

**Priority:** Low  
**Dependencies:** None  
**Estimated Time:** 2-3 days

#### Step 8.1: Landing Page Manager
- [ ] Create `lib/elder_docs/managers/landing_page_manager.rb`
- [ ] Implement HTML storage
- [ ] Add template variables
- [ ] Add API endpoints

#### Step 8.2: Frontend Editor
- [ ] Create `LandingPageEditor.jsx`
- [ ] Add HTML editor
- [ ] Add preview
- [ ] Add template variables UI

---

## Phase 4: Business Features (Week 7-8)

### Feature 9: Export Usage Metrics

**Priority:** Medium  
**Dependencies:** None  
**Estimated Time:** 4-5 days

#### Step 9.1: Metrics Collector
- [ ] Create `lib/elder_docs/managers/metrics_collector.rb`
- [ ] Implement event tracking
- [ ] Add CSV export
- [ ] Add statistics calculation
- [ ] Add API endpoints

#### Step 9.2: Frontend Tracking
- [ ] Create `frontend/src/utils/metrics.js`
- [ ] Add tracking throughout app
- [ ] Create `AnalyticsDashboard.jsx`
- [ ] Add charts/graphs
- [ ] Add export functionality

---

### Feature 10: Self-Hosted & Hosted Plans

**Priority:** High (for monetization)  
**Dependencies:** All other features  
**Estimated Time:** 3-4 days

#### Step 10.1: License Manager
- [ ] Create `lib/elder_docs/managers/license_manager.rb`
- [ ] Implement license validation
- [ ] Add feature gating
- [ ] Add API endpoints

#### Step 10.2: Feature Gating
- [ ] Create `lib/elder_docs/feature_gate.rb`
- [ ] Add gating checks throughout
- [ ] Add upgrade prompts
- [ ] Test feature restrictions

#### Step 10.3: Frontend
- [ ] Create `LicenseActivation.jsx`
- [ ] Add license status indicator
- [ ] Add upgrade prompts
- [ ] Test feature gating

---

## Weekly Schedule Example

### Week 1
- **Mon-Tue:** Feature 1.1 & 1.2 (cURL + Backend code generation)
- **Wed:** Feature 1.3 (Frontend code generation)
- **Thu:** Feature 2 (Remove Branding)
- **Fri:** Feature 3.1 (Markdown Editor Backend)

### Week 2
- **Mon-Tue:** Feature 3.2-3.3 (Markdown Editor Frontend)
- **Wed-Fri:** Feature 4 (API Versioning)

### Week 3
- **Mon-Tue:** Feature 5 (Enhanced Themes)
- **Wed-Thu:** Feature 6 (Changelog)
- **Fri:** Buffer/testing

### Week 4+
- Continue with remaining features based on priority

---

## Quick Start Checklist

Before starting any feature:

1. [ ] Read `QUICK_START.md`
2. [ ] Set up development environment
3. [ ] Start dev servers (`./scripts/dev.sh`)
4. [ ] Copy `FEATURE_CHECKLIST_TEMPLATE.md` for your feature
5. [ ] Create feature branch (`git checkout -b feature/[name]`)
6. [ ] Read feature spec in `FEATURES_TECHNICAL_SPEC.md`
7. [ ] Start implementing!

---

## Tips

1. **Start small** - Get one feature working end-to-end before moving on
2. **Test frequently** - Don't wait until everything is done
3. **Commit often** - Small, focused commits
4. **Ask for help** - Document blockers and ask questions
5. **Take breaks** - Don't burn out!

---

Good luck! 🚀

