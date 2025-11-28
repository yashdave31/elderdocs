# Testing Feature 1: API Runner Enhancements

This guide will help you test the new cURL enhancements and code generation features.

## Prerequisites

Make sure you have:
- Ruby dependencies installed: `bundle install`
- Frontend dependencies installed: `cd frontend && npm install`
- Test app dependencies: `cd test_app && bundle install`

## Step 1: Start Development Servers

### Option A: Use the Dev Script (Recommended)

```bash
# From the root directory
./scripts/dev.sh
```

This starts both:
- Rails server on port 3000
- Vite dev server on port 5173

### Option B: Manual Start

**Terminal 1 - Rails:**
```bash
cd test_app
bundle exec rails server -p 3000
```

**Terminal 2 - Vite:**
```bash
cd frontend
npm run dev
```

## Step 2: Access the Application

Open your browser and go to:
- **Vite Dev Server (Hot Reload):** http://localhost:5173
- **Rails Server:** http://localhost:3000/docs

**Recommendation:** Use the Vite dev server (port 5173) for instant hot reloading.

## Step 3: Test Enhanced cURL Support

### 3.1 Basic cURL Generation

1. Navigate to the API Explorer (right panel)
2. Select any endpoint from the sidebar (e.g., `/users` GET)
3. Configure the request:
   - Add authentication (Bearer token, API key, etc.)
   - Add query parameters if available
   - Add request body if it's a POST/PUT/PATCH request
4. Click "Show cURL Command"
5. You should see the cURL command in multi-line format

### 3.2 Test Different cURL Formats

1. With cURL preview open, use the format dropdown
2. Test each format:
   - **Multi-line:** Default format with line breaks
   - **Single-line:** All on one line
   - **Escaped:** Escaped quotes for shell scripts
   - **PowerShell:** PowerShell `Invoke-WebRequest` format
3. Verify each format looks correct

### 3.3 Test Copy Functionality

1. Select any format
2. Click the "📋 Copy" button
3. Paste into a text editor or terminal
4. Verify the command is correct

### 3.4 Test Download Functionality

1. For non-PowerShell formats:
   - Click "📥 Download .sh"
   - Verify the file downloads
   - Open it and verify it's a valid shell script
2. For PowerShell format:
   - Switch to PowerShell format
   - Click "📥 Download .ps1"
   - Verify the file downloads
   - Open it and verify it's a valid PowerShell script

### 3.5 Test with Different Request Types

**GET Request:**
- Select a GET endpoint
- Add query parameters
- Verify cURL includes query string

**POST Request:**
- Select a POST endpoint
- Add request body (JSON)
- Verify cURL includes `-d` flag with body

**PUT/PATCH Request:**
- Select a PUT or PATCH endpoint
- Add request body
- Verify cURL uses correct method

**With Authentication:**
- Test Bearer token
- Test API Key header
- Test Basic Auth
- Verify auth headers are included correctly

## Step 4: Test Code Generation

### 4.1 Basic Code Generation

1. Select an endpoint
2. Configure your request (auth, params, body)
3. Scroll down - you should see "Code Generation" section
4. Code should generate automatically

### 4.2 Test Different Languages

1. Use the language dropdown
2. Test each language:
   - **JavaScript:** Should show fetch or axios code
   - **Python:** Should show requests or httpx code
   - **Ruby:** Should show Net::HTTP or HTTParty code
3. Verify code syntax is correct

### 4.3 Test Different Variants

1. Select JavaScript
2. Try both variants:
   - **Fetch API:** Native fetch
   - **Axios:** Axios library
3. Select Python
4. Try both variants:
   - **Requests:** Synchronous requests
   - **HTTPX:** Async httpx
5. Select Ruby
6. Try both variants:
   - **Net::HTTP:** Standard library
   - **HTTParty:** HTTParty gem

### 4.4 Test Copy Code

1. Generate code in any language
2. Click "📋 Copy" button
3. Paste into a code editor
4. Verify the code is syntactically correct
5. Try running it (if you have the language installed)

### 4.5 Test with Different Request Scenarios

**Simple GET:**
- Select GET endpoint
- Verify code doesn't include body

**POST with JSON Body:**
- Select POST endpoint
- Add JSON body
- Verify code includes body parameter

**With Authentication:**
- Add Bearer token
- Verify Authorization header in generated code
- Test with API Key
- Test with Basic Auth

**With Custom Headers:**
- Add custom headers
- Verify they appear in generated code

## Step 5: Test Edge Cases

### 5.1 Empty/Invalid Data

- Select endpoint without configuring anything
- Verify code generation handles it gracefully
- Verify cURL still works

### 5.2 Special Characters

- Add special characters in parameters
- Add special characters in body
- Verify they're properly escaped in both cURL and code

### 5.3 Long URLs

- Create a request with many query parameters
- Verify cURL formatting handles it well
- Verify code generation handles it well

## Step 6: Browser Console Check

1. Open browser DevTools (F12)
2. Go to Console tab
3. Test the features
4. Verify no errors appear
5. Check Network tab for API calls:
   - `/docs/api/supported-languages` should return language list
   - `/docs/api/generate-code` should return generated code

## Step 7: Verify Backend Endpoints

### Test with curl (optional):

```bash
# Test supported languages endpoint
curl http://localhost:3000/docs/api/supported-languages

# Test code generation endpoint
curl -X POST http://localhost:3000/docs/api/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "variant": "fetch",
    "request_data": {
      "url": "https://api.example.com/users",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer token123"
      }
    }
  }'
```

## Expected Results

### cURL Enhancements:
✅ Format selector works  
✅ All formats display correctly  
✅ Copy button works  
✅ Download buttons work  
✅ Files download correctly  

### Code Generation:
✅ Code generates automatically  
✅ Language selector works  
✅ Variant selector works (when multiple variants available)  
✅ Code syntax is correct  
✅ Copy button works  
✅ Code includes all headers  
✅ Code includes body for POST/PUT/PATCH  
✅ Authentication is included correctly  

## Troubleshooting

### Code doesn't generate:
- Check browser console for errors
- Verify backend is running
- Check Network tab - is `/api/generate-code` called?
- Verify request has a URL

### cURL doesn't show:
- Make sure you clicked "Show cURL Command"
- Verify an endpoint is selected
- Check browser console for errors

### Download doesn't work:
- Check browser download settings
- Try different browser
- Check browser console for errors

### Backend errors:
- Check Rails logs: `test_app/log/development.log`
- Verify code generator files are loaded
- Restart Rails server

## Quick Test Checklist

- [ ] cURL shows in multi-line format
- [ ] Can switch to single-line format
- [ ] Can switch to escaped format
- [ ] Can switch to PowerShell format
- [ ] Copy cURL works
- [ ] Download .sh works
- [ ] Download .ps1 works
- [ ] Code generates for JavaScript
- [ ] Code generates for Python
- [ ] Code generates for Ruby
- [ ] Can switch language variants
- [ ] Copy code works
- [ ] Code includes authentication
- [ ] Code includes request body (for POST)
- [ ] No console errors

---

Happy testing! 🚀

