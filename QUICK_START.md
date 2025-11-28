# Quick Start Guide

Get up and running with ElderDocs development in 5 minutes.

## Prerequisites Check

```bash
ruby -v    # Should be 3.0+
node -v    # Should be 18+
npm -v     # Should be 9+
bundle -v  # Should be installed
```

## One-Time Setup

```bash
# 1. Install Ruby dependencies
bundle install

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Set up test app
cd test_app
bundle install
cd ..

# 4. Generate initial docs
bundle exec elderdocs deploy
```

## Start Development

### Option 1: Quick Start (Recommended)

```bash
# Start both Rails and Vite servers
./scripts/dev.sh
```

Then visit:
- **Vite Dev Server (Hot Reload):** http://localhost:5173
- **Rails Server:** http://localhost:3000/docs

### Option 2: Manual Start

```bash
# Terminal 1: Rails server
cd test_app
bundle exec rails server -p 3000

# Terminal 2: Vite dev server (for hot reloading)
cd frontend
npm run dev
```

## Making Changes

### Backend (Ruby)
1. Edit files in `lib/elder_docs/`
2. Rails auto-reloads (or restart server)
3. Test at http://localhost:3000/docs

### Frontend (React)
1. Edit files in `frontend/src/`
2. Changes appear instantly in Vite dev server
3. Test at http://localhost:5173

## Test Your Changes

1. **Update test data** (if needed):
   ```bash
   # Edit test files
   vim test_app/definitions.json
   vim test_app/articles.json
   ```

2. **Regenerate docs** (if needed):
   ```bash
   cd test_app
   bundle exec elderdocs deploy
   ```

3. **Check browser console** for errors

## Common Commands

```bash
# Rebuild frontend
cd frontend && npm run build

# Rebuild docs
cd test_app && bundle exec elderdocs deploy

# Check Rails routes
cd test_app && bundle exec rails routes | grep docs

# Rails console
cd test_app && bundle exec rails console
```

## Next Steps

1. Read `DEVELOPMENT_GUIDE.md` for detailed workflow
2. Check `FEATURES_TECHNICAL_SPEC.md` for feature specs
3. Use `FEATURE_CHECKLIST_TEMPLATE.md` for tracking progress
4. Start with Feature 1: API Runner Enhancements

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9  # Kill Rails
lsof -ti:5173 | xargs kill -9  # Kill Vite
```

**Changes not showing:**
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors
- Restart servers

**Need help?**
- Check `DEVELOPMENT_GUIDE.md`
- Review `FEATURES_TECHNICAL_SPEC.md`
- Check Rails logs: `test_app/log/development.log`

---

Happy coding! 🚀

