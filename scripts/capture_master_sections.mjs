import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\master';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function save(page, name) {
  const p1 = path.join(LOCAL_SCREENSHOT_DIR, name);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, name);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${name}`);
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

  // 1. Exp 01: Hero
  await save(page, '01_homepage_exp01_hero.png');

  // Test Menu button click explicitly via evaluate
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const menuBtn = btns.find(b => b.textContent?.trim() === 'MENU');
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '02_homepage_menu_overlay.png');

  // Close menu
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.textContent?.includes('CLOSE'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Exp 02: Iris Universe Layers (at scroll 2200px)
  console.log('Scrolling to Exp 02: Iris Universe...');
  await page.evaluate(() => window.scrollTo(0, 2400));
  await new Promise(r => setTimeout(r, 600));
  await save(page, '03_homepage_exp02_universe.png');

  // 3. Exp 03: Iris Gallery (at scroll 4200px)
  console.log('Scrolling to Exp 03: Iris Gallery...');
  const galTop = await page.evaluate(() => {
    const el = document.getElementById('gallery');
    return el ? el.getBoundingClientRect().top + window.scrollY : 4200;
  });
  console.log('galTop:', galTop);
  await page.evaluate((y) => window.scrollTo(0, y), galTop);
  await new Promise(r => setTimeout(r, 800));
  await save(page, '04_homepage_exp03_gallery.png');

  // Open gallery artwork modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exp = btns.find(b => b.textContent?.includes('EXPLORE ARTWORK'));
    if (exp) exp.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '05_homepage_exp03_gallery_modal.png');

  // Close modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cls = btns.find(b => b.textContent?.includes('CLOSE'));
    if (cls) cls.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Exp 04: Couple Experience
  console.log('Scrolling to Exp 04: Couple Experience...');
  const coupleTop = await page.evaluate(() => {
    const el = document.getElementById('couple');
    return el ? el.getBoundingClientRect().top + window.scrollY : 5400;
  });
  console.log('coupleTop:', coupleTop);
  // Scroll to couple beginning
  await page.evaluate((y) => window.scrollTo(0, y), coupleTop);
  await new Promise(r => setTimeout(r, 600));
  await save(page, '06_homepage_exp04_couple_separated.png');

  // Scroll into couple connection (middle of 200vh pin)
  await page.evaluate((y) => window.scrollTo(0, y + 1000), coupleTop);
  await new Promise(r => setTimeout(r, 600));
  await save(page, '06_homepage_exp04_couple_connected.png');

  // 5. Exp 05: Product Transformation
  console.log('Scrolling to Exp 05: Products...');
  const prodTop = await page.evaluate(() => {
    const el = document.getElementById('products');
    return el ? el.getBoundingClientRect().top + window.scrollY : 7200;
  });
  console.log('prodTop:', prodTop);
  await page.evaluate((y) => window.scrollTo(0, y), prodTop);
  await new Promise(r => setTimeout(r, 800));
  await save(page, '07_homepage_exp05_products_framed.png');

  // Switch format to Print
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const prt = btns.find(b => b.textContent?.trim().toLowerCase() === 'print');
    if (prt) prt.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '08_homepage_exp05_products_print.png');

  // 6. Exp 06: Final Invitation
  console.log('Scrolling to Exp 06: Final Invitation...');
  const inqTop = await page.evaluate(() => {
    const el = document.getElementById('inquire');
    return el ? el.getBoundingClientRect().top + window.scrollY : 8400;
  });
  console.log('inqTop:', inqTop);
  await page.evaluate((y) => window.scrollTo(0, y), inqTop);
  await new Promise(r => setTimeout(r, 800));
  await save(page, '09_homepage_exp06_invitation.png');

  // Pop-up modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pop = btns.find(b => b.textContent?.includes('FIND THE NEXT POP-UP'));
    if (pop) pop.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '10_homepage_exp06_popup_modal.png');

  console.log('All master sections captured successfully!');
  await browser.close();
}

run();
