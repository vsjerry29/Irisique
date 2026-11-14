import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const clickResult = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'MENU');
    if (!btn) return 'BUTTON NOT FOUND';
    console.log('Found button, clicking it now...');
    btn.click();
    return 'CLICKED';
  });
  console.log('Click result:', clickResult);
  await new Promise(r => setTimeout(r, 600));

  const dialogHtml = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return d ? d.outerHTML.slice(0, 200) : null;
  });
  console.log('Dialog HTML:', dialogHtml);

  await browser.close();
}

test();
