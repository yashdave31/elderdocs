#!/usr/bin/env node
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ Page Error:', err.message);
  });
  
  try {
    // Try Vite first, then Rails
    let url = 'http://localhost:5173';
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      console.log('✅ Connected to Vite (port 5173)');
    } catch (e) {
      url = 'http://localhost:3000/docs';
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      console.log('✅ Connected to Rails (port 3000)');
    }
    
    await page.waitForTimeout(3000);
    
    // Click on an endpoint
    const endpoint = await page.locator('button:has-text("GET"), button:has-text("POST")').first();
    if (await endpoint.count() > 0) {
      await endpoint.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked endpoint');
    }
    
    // Check for debug boxes
    const debugCheck = await page.evaluate(() => {
      const yellow = document.querySelector('.bg-yellow-100');
      const blue = document.querySelector('.bg-blue-100');
      const green = document.querySelector('.bg-green-100');
      const codeGen = document.querySelector('.code-generator');
      
      // Find cURL section by text content
      const allElements = Array.from(document.querySelectorAll('*'));
      const curlElement = allElements.find(el => el.textContent && el.textContent.trim().includes('cURL Command'));
      
      return {
        yellowBox: {
          exists: !!yellow,
          visible: yellow ? yellow.offsetParent !== null : false,
          text: yellow ? yellow.textContent : null,
          position: yellow ? yellow.getBoundingClientRect() : null
        },
        blueBox: {
          exists: !!blue,
          visible: blue ? blue.offsetParent !== null : false,
          text: blue ? blue.textContent : null,
          position: blue ? blue.getBoundingClientRect() : null
        },
        greenBox: {
          exists: !!green,
          visible: green ? green.offsetParent !== null : false,
          text: green ? green.textContent : null,
          position: green ? green.getBoundingClientRect() : null
        },
        codeGenerator: {
          exists: !!codeGen,
          visible: codeGen ? codeGen.offsetParent !== null : false,
          height: codeGen ? codeGen.offsetHeight : 0,
          position: codeGen ? codeGen.getBoundingClientRect() : null
        },
        curlSection: {
          exists: !!curlElement,
          visible: curlElement ? curlElement.offsetParent !== null : false,
          position: curlElement ? curlElement.getBoundingClientRect() : null
        },
        apiExplorerText: document.body.innerText.includes('Code Generation'),
        apiExplorerCurl: document.body.innerText.includes('cURL Command'),
        allText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('\n=== Component Check ===');
    console.log(JSON.stringify(debugCheck, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: 'component-debug.png', fullPage: true });
    console.log('\n✅ Screenshot saved to component-debug.png');
    
    if (errors.length > 0) {
      console.log('\n❌ Errors found:', errors);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
})();

