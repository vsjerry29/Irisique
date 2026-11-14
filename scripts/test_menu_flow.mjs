import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check clicking menu
  const menuBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('MENU'));
  });
  console.log('menuBtn exists:', !!menuBtn);
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const dialogOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    console.log('Dialog open after click:', dialogOpen);

    const closeBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CLOSE'));
    });
    console.log('closeBtn exists:', !!closeBtn);
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
    const dialogStillOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    console.log('Dialog still open after close click:', dialogStillOpen);
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    console.log('Body overflow:', bodyOverflow);
  }

  // Now test scrolling to gallery
  console.log('Scrolling to gallery...');
  const galPos = await page.evaluate(() => {
    const el = document.getElementById('gallery');
    return el ? el.offsetTop : 0;
  });
  console.log('galPos:', galPos);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), galPos);
  await new Promise(r => setTimeout(r, 500));
  const currentScrollY = await page.evaluate(() => window.scrollY);
  console.log('currentScrollY after scrollTo:', currentScrollY);

  await browser.close();
}

test();
