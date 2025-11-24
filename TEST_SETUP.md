# BetterDocs Test Setup Guide

## Quick Test Setup

Follow these steps to see BetterDocs in action with the test API:

### Step 1: Copy Test Files

Copy the test files to your Rails application root:

```bash
# From the betterdocs directory
cp examples/test-definitions.json /path/to/your/rails/app/definitions.json
cp examples/test-articles.json /path/to/your/rails/app/articles.json
```

### Step 2: Add Gem to Rails App

In your Rails application's `Gemfile`:

```ruby
gem 'better_docs', path: '/Users/yashdave00/Desktop/betterdocs'
```

Then run:

```bash
bundle install
```

### Step 3: Generate Documentation

```bash
bundle exec betterdocs deploy
```

### Step 4: Mount the Engine

Add to your Rails `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  mount BetterDocs::Engine, at: '/docs'
  # ... your other routes
end
```

### Step 5: Start Rails Server

```bash
rails server
```

### Step 6: View Documentation

Open your browser and navigate to:

```
http://localhost:3000/docs
```

## Testing the API Explorer

The test API uses JSONPlaceholder (https://jsonplaceholder.typicode.com), which is a free fake REST API for testing.

### Try These Endpoints:

1. **GET /posts** - Get all posts
   - Try adding query parameters: `userId=1` or `_limit=5`

2. **GET /posts/{id}** - Get a specific post
   - Enter `1` in the Path Parameters section

3. **POST /posts** - Create a new post
   - Use the example JSON body:
     ```json
     {
       "title": "My Test Post",
       "body": "This is a test post created from BetterDocs!",
       "userId": 1
     }
     ```

4. **PUT /posts/{id}** - Update entire post
   - Enter post ID in path parameters
   - Use example JSON body

5. **PATCH /posts/{id}** - Partially update post
   - Enter post ID in path parameters
   - Try updating just the title

6. **DELETE /posts/{id}** - Delete a post
   - Enter post ID in path parameters

7. **GET /users** - List all users

8. **GET /users/{id}** - Get specific user

9. **GET /comments** - Get all comments
   - Try filtering: `postId=1`

10. **POST /comments** - Create a comment
    - Use example JSON body

## Testing Authentication

Try different authentication types:

1. **Bearer Token**: Enter any token (JSONPlaceholder doesn't require auth, but you can test the header)
2. **API Key Header**: Enter a test key
3. **Basic Auth**: Enter `username:password` format
4. **OAuth 2.0**: Enter an OAuth token

Note: JSONPlaceholder doesn't actually require authentication, but you can see how the headers are sent.

## Features to Test

✅ **Navigation**: Switch between API Reference and Articles tabs
✅ **Endpoint Selection**: Click different endpoints in the sidebar
✅ **Parameter Input**: Fill in path, query, and header parameters
✅ **Request Body**: Enter JSON for POST/PUT/PATCH requests
✅ **Authentication**: Switch between auth types and enter credentials
✅ **Response Display**: See status codes, response time, and formatted JSON
✅ **Responsive Design**: Resize browser window to see mobile layout

## Troubleshooting

### Build Fails

If `betterdocs deploy` fails:

1. Make sure Node.js is installed: `node --version`
2. Install frontend dependencies: `cd frontend && npm install`
3. Try building manually: `cd frontend && npm run build`

### Routes Not Working

If `/docs` doesn't work:

1. Check routes: `rails routes | grep docs`
2. Restart Rails server
3. Verify engine is mounted in `config/routes.rb`

### CORS Errors

JSONPlaceholder allows CORS, but if you see CORS errors:

- The API might not allow browser requests
- Try testing from your backend instead
- Or use a CORS proxy

## Next Steps

Once you've tested with the example API:

1. Replace `definitions.json` with your own OpenAPI spec
2. Customize `articles.json` with your documentation
3. Optionally create `betterdocs.yml` for configuration
4. Deploy to production!

Enjoy your beautiful, simple API documentation! 🎉

