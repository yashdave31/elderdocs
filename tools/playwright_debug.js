#!/usr/bin/env node
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log('[console]', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.log('[pageerror]', err.message);
    console.log('[pageerror stack]', err.stack);
  });
  try {
    const response = await page.goto('http://localhost:3000/docs', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('HTTP status:', response.status());
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    // Check if BetterDocsData exists
    const hasData = await page.evaluate(() => {
      return typeof window.BetterDocsData !== 'undefined';
    });
    console.log('BetterDocsData exists:', hasData);
    
    if (hasData) {
      const dataInfo = await page.evaluate(() => {
        const data = window.BetterDocsData;
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
          hasWelcome: content.includes('Welcome to BetterDocs'),
          hasApiBasics: content.includes('API Basics'),
          bodyText: content.substring(0, 500)
        };
      });
      console.log('Article content check:', JSON.stringify(articleContent, null, 2));
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

