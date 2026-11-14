import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('Dialog initially:', await page.evaluate(() => !!document.querySelector('[role="dialog"]')));

  // Click MENU
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'MENU');
    btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  console.log('Dialog after MENU click:', await page.evaluate(() => !!document.querySelector('[role="dialog"]')));

  // Close via Escape key
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));
  console.log('Dialog after Escape key:', await page.evaluate(() => !!document.querySelector('[role="dialog"]')));

  await browser.close();
}

test();
