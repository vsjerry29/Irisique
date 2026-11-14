import puppeteer from 'puppeteer-core';

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const info = await page.evaluate(() => {
    const elAtCenter = document.elementFromPoint(720, 450);
    return {
      elAtCenter: elAtCenter ? elAtCenter.outerHTML.slice(0, 300) : null,
      scrollY: window.scrollY,
      bodyHeight: document.body.scrollHeight,
      bodyStyles: document.body.getAttribute('style'),
      overflow: window.getComputedStyle(document.body).overflow,
      htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
    };
  });
  console.log('Page info before scroll:', info);

  // Now scroll to 4200
  await page.evaluate(() => window.scrollTo(0, 4200));
  await new Promise(r => setTimeout(r, 500));

  const infoAfter = await page.evaluate(() => {
    const elAtCenter = document.elementFromPoint(720, 450);
    return {
      elAtCenter: elAtCenter ? elAtCenter.outerHTML.slice(0, 300) : null,
      scrollY: window.scrollY,
      bodyHeight: document.body.scrollHeight,
      overflow: window.getComputedStyle(document.body).overflow,
    };
  });
  console.log('Page info after scroll:', infoAfter);

  await browser.close();
}

debug();
