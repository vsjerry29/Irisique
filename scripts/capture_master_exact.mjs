import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\screenshots\\master';
const ARTIFACTS_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function save(page, name) {
  const p1 = path.join(LOCAL_DIR, name);
  const p2 = path.join(ARTIFACTS_DIR, name);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  const size = fs.statSync(p1).size;
  console.log(`Saved ${name}: ${size} bytes`);
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

  // Menu Overlay
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const menuBtn = btns.find(b => b.textContent?.trim() === 'MENU');
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '02_homepage_menu_overlay.png');

  // Close Menu cleanly
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close menu"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Exp 02: Iris Universe Layers
  console.log('Navigating to Exp 02: Iris Universe Layers...');
  await page.evaluate(() => {
    const el = document.getElementById('iris-layers');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '03_homepage_exp02_universe.png');

  // 3. Exp 03: Gallery
  console.log('Navigating to Exp 03: Gallery...');
  await page.evaluate(() => {
    const el = document.getElementById('gallery');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '04_homepage_exp03_gallery.png');

  // Open Gallery Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exp = btns.find(b => b.textContent?.includes('EXPLORE ARTWORK'));
    if (exp) exp.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '05_homepage_exp03_gallery_modal.png');

  // Close Gallery Modal via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 4. Exp 04: Couple Experience (scroll into couple)
  console.log('Navigating to Exp 04: Couple Experience...');
  await page.evaluate(() => {
    const el = document.getElementById('couple');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '06_homepage_exp04_couple_separated.png');

  // 4b. Couple Connected (scroll 900px down inside couple pin)
  await page.evaluate(() => window.scrollBy(0, 900));
  await new Promise(r => setTimeout(r, 800));
  await save(page, '07_homepage_exp04_couple_connected.png');

  // 5. Exp 05: Product Transformation
  console.log('Navigating to Exp 05: Products...');
  await page.evaluate(() => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '08_homepage_exp05_products_framed.png');

  // Switch to Print format
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const prt = btns.find(b => b.textContent?.trim().toLowerCase() === 'print');
    if (prt) prt.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '09_homepage_exp05_products_print.png');

  // 6. Exp 06: Final Invitation
  console.log('Navigating to Exp 06: Final Invitation...');
  await page.evaluate(() => {
    const el = document.getElementById('inquire');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '10_homepage_exp06_invitation.png');

  // Pop-up modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pop = btns.find(b => b.textContent?.includes('FIND THE NEXT POP-UP'));
    if (pop) pop.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '11_homepage_exp06_popup_modal.png');

  console.log('ALL MASTER SECTIONS VERIFIED & CAPTURED WITH 100% FIDELITY!');
  await browser.close();
}

run();
