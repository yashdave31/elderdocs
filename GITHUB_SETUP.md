# GitHub Setup Guide

## Initial Setup

1. **Create a new GitHub repository**

```bash
# On GitHub, create a new repo named "elder_docs"
```

2. **Initialize git and push**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/elder_docs.git
git push -u origin main
```

3. **Update homepage in gemspec**

Edit `elder_docs.gemspec` and replace:
```ruby
spec.homepage = 'https://github.com/YOUR_USERNAME/elder_docs'
```

## Publishing to RubyGems

1. **Build the gem**

```bash
gem build elder_docs.gemspec
```

2. **Push to RubyGems** (first time)

```bash
gem push elder_docs-0.1.0.gem
```

You'll need a RubyGems account and API key.

3. **For updates**, bump version in `lib/elder_docs/version.rb` and rebuild.

## What's Included

- ✅ Clean README.md
- ✅ .gitignore (excludes node_modules, build artifacts, etc.)
- ✅ LICENSE.txt (MIT)
- ✅ elderdocs.yml.example (config template)
- ✅ All source code and assets

## What's Excluded (.gitignore)

- node_modules/
- vendor/bundle/
- Build outputs
- Test app dependencies
- User-specific config files

