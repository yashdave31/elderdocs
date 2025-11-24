#!/bin/bash

# ElderDocs Quick Development Build Script
# Rebuilds and reinstalls the gem locally for testing

set -e

GEM_NAME="elder_docs"

echo "🔨 Quick rebuild for development..."
echo ""

# Clean
echo "🧹 Cleaning..."
rm -f *.gem
rm -rf pkg/
echo "✅ Cleaned"
echo ""

# Build
echo "📦 Building gem..."
gem build "${GEM_NAME}.gemspec"

GEM_FILE=$(ls -t ${GEM_NAME}-*.gem | head -n 1)
echo "✅ Built: ${GEM_FILE}"
echo ""

# Install locally
echo "📥 Installing locally..."
# Install dependencies first (Rails will be provided by host app's Bundler)
echo "Installing dependencies..."
gem install thor -v '~> 1.2' --no-document 2>/dev/null || true
gem install openapi_parser -v '~> 2.0' --no-document 2>/dev/null || true
gem install json -v '~> 2.6' --no-document 2>/dev/null || true

# Install gem with --ignore-dependencies since Rails is managed by host app's Bundler
gem install "${GEM_FILE}" --local --force --ignore-dependencies --no-document

echo ""
echo "✅ Done! Your changes are now available locally."
echo ""
echo "Note: Rails dependency will be resolved by Bundler when you use this gem"
echo "      in your Rails application (via Gemfile)."
echo ""
echo "To test in your Rails app:"
echo "  1. cd /path/to/your/rails/app"
echo "  2. bundle exec elderdocs deploy"
echo ""

