import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\fixed_hero_and_gallery\\multi_res';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '1770x830', width: 1770, height: 830 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '390x844_mobile', width: 390, height: 844 },
];

async function testResolutions() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const vp of VIEWPORTS) {
    console.log(`Testing viewport ${vp.name}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // 1. Resting Hero at 500ms
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_01_hero.png`) });

    // 2. Scroll to settled gallery
    const scrollTarget = Math.round(vp.height * 1.55 * 0.95);
    await page.evaluate((st) => window.scrollTo(0, st), scrollTarget);
    await new Promise(r => setTimeout(r, 800));

    // Switch to COUPLE
    await page.evaluate(() => {
      const coupleBtn = document.querySelector('button[data-tab="COUPLE"]');
      if (coupleBtn) coupleBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_02_gallery_couple.png`) });

    await page.close();
  }

  await browser.close();
  console.log('Multi-resolution verification complete!');
}

testResolutions().catch(console.error);
