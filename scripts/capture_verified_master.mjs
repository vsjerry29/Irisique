import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function save(page, name) {
  const p = path.join(ARTIFACTS_DIR, name);
  await page.screenshot({ path: p });
  console.log(`Saved ${name}: ${fs.statSync(p).size} bytes`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Hero
  await save(page, '01_homepage_exp01_hero.png');

  // 2. Open Menu Overlay & Screenshot
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'MENU');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '02_homepage_menu_overlay.png');

  // 3. Close Menu by clicking close button directly
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close menu"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Verify menu is gone
  const isMenuPresent = await page.evaluate(() => !!document.querySelector('button[aria-label="Close menu"]'));
  console.log('Is menu overlay still present?', isMenuPresent);

  // 4. Universe (scroll 2880)
  await page.evaluate(() => window.scrollTo(0, 2880));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '03_homepage_exp02_universe.png');

  // 5. Gallery (scroll 5580)
  await page.evaluate(() => window.scrollTo(0, 5580));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '04_homepage_exp03_gallery.png');

  // Gallery Modal
  await page.evaluate(() => {
    const exp = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('EXPLORE ARTWORK'));
    if (exp) exp.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '05_homepage_exp03_gallery_modal.png');

  // Close Gallery Modal via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 6. Couple Separated (scroll 6700)
  await page.evaluate(() => window.scrollTo(0, 6700));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '06_homepage_exp04_couple_separated.png');

  // 7. Couple Connected (scroll 7800)
  await page.evaluate(() => window.scrollTo(0, 7800));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '07_homepage_exp04_couple_connected.png');

  // 8. Products Framed (scroll 9400)
  await page.evaluate(() => window.scrollTo(0, 9400));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '08_homepage_exp05_products_framed.png');

  // Switch to Print
  await page.evaluate(() => {
    const prt = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase() === 'print');
    if (prt) prt.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '09_homepage_exp05_products_print.png');

  // 9. Invitation (scroll 10510)
  await page.evaluate(() => window.scrollTo(0, 10510));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '10_homepage_exp06_invitation.png');

  // Pop-up modal
  await page.evaluate(() => {
    const pop = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('FIND THE NEXT POP-UP'));
    if (pop) pop.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '11_homepage_exp06_popup_modal.png');

  console.log('ALL EXACT MASTER SCREENSHOTS CAPTURED WITH ACCURACY!');
  await browser.close();
}

run();
