# ElderDocs Installation Guide

## For Rails Application Users

### Step 1: Add the Gem

Add ElderDocs to your Rails application's `Gemfile`:

```ruby
gem 'elder_docs', path: '/path/to/elderdocs'  # For local development
```

Then run:

```bash
bundle install
```

### Step 2: Create Input Files

Create two JSON files in your Rails application root:

1. **`definitions.json`** - Your OpenAPI 3.x specification
2. **`articles.json`** - Your custom documentation articles

See the `examples/` directory for sample files.

### Step 3: Generate Documentation

Run the deployment command:

```bash
bundle exec elderdocs deploy
```

This will:
- Validate your JSON files
- Compile the data
- Build the React frontend
- Place assets in the gem directory

### Step 4: Mount the Engine (Optional)

By default, ElderDocs automatically mounts at `/docs`. If you want to customize the mount path, add this to your `config/routes.rb`:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount ElderDocs::Engine, at: '/api-docs'  # Custom path
  # ... your other routes
end
```

### Step 5: Access Documentation

Start your Rails server and visit:

```
http://localhost:3000/docs
```

## Troubleshooting

### Node.js Not Found

If you get an error about Node.js not being found:

1. Install Node.js (version 16 or higher)
2. Verify installation: `node --version`
3. Run `elderdocs deploy` again

### Build Failures

If the frontend build fails:

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Try building manually: `npm run build`
4. Check for error messages

### Missing Files

If you get errors about missing JSON files:

1. Ensure `definitions.json` exists in your Rails root
2. Create `articles.json` (can be empty array: `[]`)
3. Run `elderdocs deploy` again

### Routes Not Working

If `/docs` doesn't work:

1. Check that the gem is properly loaded: `bundle list | grep elder_docs`
2. Restart your Rails server
3. Check Rails routes: `rails routes | grep docs`
4. Verify the engine is mounted correctly

## Development Mode

For development, you can watch for changes:

```bash
# Terminal 1: Rails server
rails server

# Terminal 2: Frontend dev server (optional, for frontend development)
cd frontend
npm run dev
```

Note: In production, always use `elderdocs deploy` to generate static assets.

