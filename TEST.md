# Testing ElderDocs

## Quick Test

Run the test script:

```bash
./test.sh
```

This will:
1. Install dependencies
2. Generate ElderDocs documentation
3. Start a Rails server
4. Open http://localhost:3000/docs in your browser

## Manual Test

1. Navigate to test app:
```bash
cd test_app
```

2. Install dependencies:
```bash
bundle install
```

3. Generate documentation:
```bash
bundle exec elderdocs deploy
```

4. Start server:
```bash
bundle exec rails server
```

5. Visit http://localhost:3000/docs

## Test Files

The test app includes:
- `definitions.json` - Comprehensive OpenAPI spec with GET, POST, PUT, PATCH, DELETE examples
- `articles.json` - Sample documentation articles

These use the JSONPlaceholder API (https://jsonplaceholder.typicode.com) which is free and doesn't require authentication.

## What to Test

✅ **UI Design**: Bright yellow/white theme with sharp corners and big fonts
✅ **Navigation**: Switch between API Reference and Articles
✅ **Endpoints**: Try different HTTP methods (GET, POST, PUT, PATCH, DELETE)
✅ **Parameters**: Test path parameters, query parameters, and headers
✅ **Request Bodies**: Enter JSON for POST/PUT/PATCH requests
✅ **Authentication**: Switch between Bearer, API Key, Basic, and OAuth2
✅ **Responses**: See formatted JSON responses with status codes

## Example Requests

### GET Request
1. Click "GET /posts" in sidebar
2. Optionally add query parameter: `userId=1`
3. Click "SEND REQUEST"
4. See the list of posts

### POST Request
1. Click "POST /posts" in sidebar
2. Enter JSON body:
```json
{
  "title": "My Test Post",
  "body": "Testing ElderDocs!",
  "userId": 1
}
```
3. Click "SEND REQUEST"
4. See the created post

### Path Parameters
1. Click "GET /posts/{id}"
2. Enter `1` in Path Parameters section
3. Click "SEND REQUEST"
4. See the specific post

## Troubleshooting

### Bundle Install Fails
Make sure you have Ruby and Bundler installed:
```bash
ruby --version
gem install bundler
```

### ElderDocs Deploy Fails
Make sure Node.js is installed:
```bash
node --version
npm --version
```

If Node.js is missing, install it from https://nodejs.org/

### Server Won't Start
Check if port 3000 is already in use:
```bash
lsof -ti:3000
```

Use a different port:
```bash
PORT=3001 rails server
```

