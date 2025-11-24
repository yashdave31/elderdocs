# Quick Test Guide

Test ElderDocs right from the gem directory - no external Rails app needed!

## Option 1: Use the Test Script (Easiest)

Just run:

```bash
./test.sh
```

This will automatically:
1. Install dependencies
2. Generate ElderDocs documentation  
3. Start the Rails server
4. Open http://localhost:3000/docs

## Option 2: Manual Setup

1. **Navigate to test app:**
```bash
cd test_app
```

2. **Install dependencies:**
```bash
bundle install
```

3. **Generate documentation:**
```bash
bundle exec elderdocs deploy
```

4. **Start server:**
```bash
bundle exec rails server
```

5. **Visit http://localhost:3000/docs**

## What You'll See

✨ **Bright yellow and white design** with sharp corners and big fonts
📱 **Three-column layout**: Navigation | Documentation | API Explorer
🚀 **Try endpoints** with real API calls to JSONPlaceholder
🔐 **Test auth types**: Bearer, API Key, Basic, OAuth2
📚 **Read articles**: Getting started guides and tips

## Try These

1. Click **GET /posts** → Click **SEND REQUEST** → See results!
2. Click **POST /posts** → Enter JSON body → Send!
3. Click **GET /posts/{id}** → Enter `1` in Path Parameters → Send!
4. Switch auth types in the right panel
5. Read the "Getting Started" article

## Test Files Included

The test app already has:
- `definitions.json` - Comprehensive OpenAPI spec
- `articles.json` - Sample documentation

These use JSONPlaceholder API (free, no auth needed).

That's it! Dead simple. 🎉
