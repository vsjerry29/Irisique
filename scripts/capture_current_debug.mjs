import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\debug_current_state';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Initial load (after 500ms)
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '01_initial_500ms.png') });

  // 2. Wait 3.5s for entrance to finish
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(OUT_DIR, '02_entrance_settled.png') });

  // 3. Scroll to 1035 (settled gallery)
  await page.evaluate(() => window.scrollTo(0, 1035));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '03_gallery_solo.png') });

  // Click COUPLE tab
  await page.evaluate(() => {
    const coupleBtn = document.querySelector('button[data-tab="COUPLE"]');
    if (coupleBtn) coupleBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '04_gallery_couple.png') });

  // 4. Scroll to 1400 (between gallery and collection)
  await page.evaluate(() => window.scrollTo(0, 1400));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '05_scroll_1400.png') });

  // 5. Scroll to 1935 (start of collection)
  await page.evaluate(() => window.scrollTo(0, 1935));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '06_scroll_1935.png') });

  await browser.close();
  console.log('Screenshots saved to:', OUT_DIR);
}

capture().catch(console.error);
