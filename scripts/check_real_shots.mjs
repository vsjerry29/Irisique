import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const targets = [
    { name: 'exp01_hero.png', y: 0 },
    { name: 'exp02_universe.png', y: 2200 },
    { name: 'exp03_gallery.png', y: 3800 },
    { name: 'exp04_couple_attraction.png', y: 5200 },
    { name: 'exp04_couple_connected.png', y: 5900 },
    { name: 'exp05_product_framed.png', y: 6900 },
    { name: 'exp06_invitation.png', y: 8000 },
  ];

  for (const t of targets) {
    await page.evaluate((y) => window.scrollTo(0, y), t.y);
    await new Promise(r => setTimeout(r, 600));
    const outPath = path.join(OUT_DIR, t.name);
    await page.screenshot({ path: outPath });
    const stat = fs.statSync(outPath);
    console.log(`Saved ${t.name} (scroll ${t.y}): ${stat.size} bytes`);
  }

  // Also test clicking MENU button to open MenuOverlay
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const menuBtn = btns.find(b => b.textContent?.trim() === 'MENU');
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const menuPath = path.join(OUT_DIR, 'menu_fullscreen_overlay.png');
  await page.screenshot({ path: menuPath });
  console.log(`Saved menu_fullscreen_overlay.png: ${fs.statSync(menuPath).size} bytes`);

  await browser.close();
}

run();
