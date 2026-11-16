import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1770, height: 830, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4500));
  
  const info = await page.evaluate(() => {
    const section = document.querySelector('[data-section="unified-iris"]');
    const canvas = document.querySelector('canvas');
    const h1 = document.querySelector('h1');
    const bookCta = document.querySelector('a[href="/book"]');
    const heroText = document.querySelector('#explore div.opacity-0, #explore div[class*="z-25"]');
    const getBox = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, bottom: r.bottom, right: r.right, width: r.width, height: r.height };
    };
    return {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      sectionBox: getBox(section),
      canvasBox: getBox(canvas),
      h1Box: getBox(h1),
      bookCtaBox: getBox(bookCta),
      h1Text: h1?.innerText,
      heroTextBox: getBox(heroText),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\current_inspect_1770x830.png' });
  await browser.close();
}

main().catch(console.error);
