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
gem install "${GEM_FILE}" --local --force

echo ""
echo "✅ Done! Your changes are now available locally."
echo ""
echo "To test in your Rails app:"
echo "  1. cd /path/to/your/rails/app"
echo "  2. bundle exec elderdocs deploy"
echo ""

