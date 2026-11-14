import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\anatomy';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const sectionEl = await page.$('#anatomy');
  if (sectionEl) {
    const p1 = path.join(SCREENSHOT_DIR, '01_full_anatomy_section.png');
    const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, '01_full_anatomy_section.png');
    await sectionEl.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log('Saved 01_full_anatomy_section.png');
  }

  // Click on CORNEA
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('01. CORNEA'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  if (sectionEl) {
    const p1 = path.join(SCREENSHOT_DIR, '02_full_cornea_selected.png');
    const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, '02_full_cornea_selected.png');
    await sectionEl.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log('Saved 02_full_cornea_selected.png');
  }

  // Click on RETINA
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('07. RETINA'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  if (sectionEl) {
    const p1 = path.join(SCREENSHOT_DIR, '03_full_retina_selected.png');
    const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, '03_full_retina_selected.png');
    await sectionEl.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log('Saved 03_full_retina_selected.png');
  }

  await browser.close();
  console.log('Done captures');
}

capture().catch(console.error);
