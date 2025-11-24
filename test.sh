#!/bin/bash

# ElderDocs Test Script
# This script sets up and runs the test Rails app

set -e

echo "🚀 Setting up ElderDocs test environment..."

cd "$(dirname "$0")/test_app"

# Check if bundle is installed
if ! command -v bundle &> /dev/null; then
    echo "❌ Error: Bundler is not installed. Please install it first:"
    echo "   gem install bundler"
    exit 1
fi

# Install gems
echo "📦 Installing dependencies..."
bundle install

# Generate documentation
echo "📚 Generating ElderDocs documentation..."
bundle exec elderdocs deploy

# Start server
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting Rails server..."
echo "📖 Visit http://localhost:3000/docs to see ElderDocs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

bundle exec rails server -p 3000

