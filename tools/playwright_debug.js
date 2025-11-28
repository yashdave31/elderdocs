#!/usr/bin/env node
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    console.log('[console]', msg.type(), msg.text());
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('[pageerror]', err.message);
    console.log('[pageerror stack]', err.stack);
    consoleErrors.push(err.message);
  });
  
  // Store errors in window for later access
  await page.addInitScript(() => {
    window.__consoleErrors = [];
    const originalError = console.error;
    console.error = function(...args) {
      window.__consoleErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
  });
  try {
    // Try Vite dev server first (port 5173), then Rails (port 3000)
    let url = 'http://localhost:5173';
    let response;
    try {
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      console.log(`✅ Connected to Vite dev server (port 5173)`);
    } catch (e) {
      url = 'http://localhost:3000/docs';
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      console.log(`✅ Connected to Rails server (port 3000)`);
    }
    console.log('HTTP status:', response.status());
    console.log('URL:', url);
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    // Check if ElderDocsData exists
    const hasData = await page.evaluate(() => {
      return typeof window.ElderDocsData !== 'undefined';
    });
    console.log('ElderDocsData exists:', hasData);
    
    if (hasData) {
      const dataInfo = await page.evaluate(() => {
        const data = window.ElderDocsData;
        return {
          hasOpenAPI: !!data.openapi,
          hasArticles: !!data.articles,
          articlesCount: data.articles ? data.articles.length : 0,
          articles: data.articles ? data.articles.map(a => ({ id: a.id, title: a.title })) : []
        };
      });
      console.log('Data info:', JSON.stringify(dataInfo, null, 2));
    }
    
    // Try to find and click the Guides button
    const guidesButton = await page.locator('button:has-text("Guides")').first();
    const guidesExists = await guidesButton.count() > 0;
    console.log('Guides button exists:', guidesExists);
    
    if (guidesExists) {
      await guidesButton.click();
      await page.waitForTimeout(1000);
      
      // Check what's rendered
      const articlesVisible = await page.locator('text=Getting Started').count();
      console.log('Articles visible:', articlesVisible);
      
      // Check if any article content is visible
      const articleContent = await page.evaluate(() => {
        const content = document.body.innerText;
        return {
          hasGettingStarted: content.includes('Getting Started'),
          hasWelcome: content.includes('Welcome to ElderDocs'),
          hasApiBasics: content.includes('API Basics'),
          bodyText: content.substring(0, 500)
        };
      });
      console.log('Article content check:', JSON.stringify(articleContent, null, 2));
    }
    
    // Check for Code Generation and cURL sections
    console.log('\n=== Checking Code Generation and cURL Sections ===');
    
    // Select an endpoint first
    const endpointButton = await page.locator('button:has-text("GET"), button:has-text("POST")').first();
    const endpointExists = await endpointButton.count() > 0;
    console.log('Endpoint button exists:', endpointExists);
    
    if (endpointExists) {
      await endpointButton.click();
      await page.waitForTimeout(2000);
      
      // Check for Code Generation section
      const codeGenSection = await page.locator('text=Code Generation').count();
      console.log('Code Generation text found:', codeGenSection);
      
      // Check for cURL Command section
      const curlSection = await page.locator('text=cURL Command').count();
      console.log('cURL Command text found:', curlSection);
      
      // Check for debug boxes
      const debugBoxes = await page.evaluate(() => {
        const yellowBox = document.querySelector('.bg-yellow-100');
        const blueBox = document.querySelector('.bg-blue-100');
        const greenBox = document.querySelector('.bg-green-100');
        return {
          yellowBox: !!yellowBox,
          blueBox: !!blueBox,
          greenBox: !!greenBox,
          yellowText: yellowBox ? yellowBox.textContent : null,
          blueText: blueBox ? blueBox.textContent : null,
          greenText: greenBox ? greenBox.textContent : null
        };
      });
      console.log('Debug boxes:', JSON.stringify(debugBoxes, null, 2));
      
      // Check for CodeGenerator component
      const codeGenerator = await page.evaluate(() => {
        const codeGenDiv = document.querySelector('.code-generator');
        return {
          exists: !!codeGenDiv,
          visible: codeGenDiv ? codeGenDiv.offsetParent !== null : false,
          display: codeGenDiv ? window.getComputedStyle(codeGenDiv).display : null,
          visibility: codeGenDiv ? window.getComputedStyle(codeGenDiv).visibility : null,
          height: codeGenDiv ? codeGenDiv.offsetHeight : 0,
          innerHTML: codeGenDiv ? codeGenDiv.innerHTML.substring(0, 200) : null
        };
      });
      console.log('CodeGenerator component:', JSON.stringify(codeGenerator, null, 2));
      
      // Check for language selector
      const languageSelect = await page.locator('select').filter({ hasText: 'JavaScript' }).count();
      console.log('Language selector found:', languageSelect);
      
      // Check for cURL format selector
      const curlFormatSelect = await page.locator('select').filter({ hasText: 'Multi-line' }).count();
      console.log('cURL format selector found:', curlFormatSelect);
      
      // Get all visible text in API Explorer panel
      const apiExplorerText = await page.evaluate(() => {
        const explorer = document.querySelector('.w-\\[360px\\]');
        if (!explorer) return 'API Explorer not found';
        return {
          text: explorer.innerText.substring(0, 1000),
          hasCodeGen: explorer.innerText.includes('Code Generation'),
          hasCurl: explorer.innerText.includes('cURL'),
          hasDebug: explorer.innerText.includes('DEBUG'),
          childrenCount: explorer.children.length
        };
      });
      console.log('API Explorer content:', JSON.stringify(apiExplorerText, null, 2));
      
      // Check console errors
      const consoleErrors = await page.evaluate(() => {
        return window.__consoleErrors || [];
      });
      if (consoleErrors.length > 0) {
        console.log('Console errors:', consoleErrors);
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved to debug-screenshot.png');
    
  } catch (err) {
    console.error('Playwright error:', err);
    console.error('Stack:', err.stack);
  } finally {
    await browser.close();
  }
})();

