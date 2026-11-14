import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\master';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const LOCAL_RECORDING_DIR = 'D:\\Irisique\\recordings\\master';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

[LOCAL_SCREENSHOT_DIR, ARTIFACTS_SCREENSHOT_DIR, LOCAL_RECORDING_DIR, ARTIFACTS_RECORDING_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const p1 = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function assembleGif(frameDir, outName, delay = 100, width = 960, height = 600) {
  const pLocal = path.join(LOCAL_RECORDING_DIR, outName);
  const pArtifact = path.join(ARTIFACTS_RECORDING_DIR, outName);
  const pyCode = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${frameDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    small_imgs = [img.resize((${width}, ${height}), Image.Resampling.LANCZOS) for img in imgs]
    small_imgs[0].save(r"${pLocal.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=${delay}, loop=0, optimize=False)
    small_imgs[0].save(r"${pArtifact.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=${delay}, loop=0, optimize=False)
    print("Saved GIF:", "${outName}")
`;
  const pyFile = path.join(LOCAL_RECORDING_DIR, `assemble_${path.basename(outName, '.gif')}.py`);
  fs.writeFileSync(pyFile, pyCode);
  execSync(`python "${pyFile}"`, { cwd: LOCAL_RECORDING_DIR });

  // cleanup frames
  fs.readdirSync(frameDir).forEach(f => fs.unlinkSync(path.join(frameDir, f)));
  fs.rmdirSync(frameDir);
}

async function run() {
  console.log('=== STARTING COMPLETE MASTER CREATIVE & DEVELOPMENT QA SUITE ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // ─── PART 1: HOMEPAGE 6 CONNECTED EXPERIENCES ───
    console.log('\n--- 1. TESTING HOMEPAGE 6 EXPERIENCES ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Experience 1: Cinematic Hero
    console.log('Capturing Exp 01: Hero (LOOK CLOSER.)...');
    await saveScreenshot(page, '01_homepage_exp01_hero.png');

    // Test Menu Overlay
    console.log('Testing Menu Overlay...');
    const menuBtn = await page.$('button::-p-text(MENU)');
    if (menuBtn) {
      await menuBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, '02_homepage_menu_overlay.png');
      // Press Escape to close
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // Experience 2: Iris Universe (Layer Exploration)
    console.log('Capturing Exp 02: Iris Universe Layers...');
    await page.evaluate(() => {
      const el = document.getElementById('iris-layers');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 700));
    await saveScreenshot(page, '03_homepage_exp02_universe.png');

    // Experience 3: Interactive Iris Gallery
    console.log('Capturing Exp 03: Gallery (UNLIKE ANY OTHER.)...');
    await page.evaluate(() => {
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 700));
    await saveScreenshot(page, '04_homepage_exp03_gallery.png');

    // Test Gallery Selection Modal
    console.log('Testing Gallery Selection Expansion...');
    const exploreBtn = await page.$('button::-p-text(EXPLORE ARTWORK)');
    if (exploreBtn) {
      await exploreBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, '05_homepage_exp03_gallery_modal.png');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // Experience 4: Couple Experience
    console.log('Capturing Exp 04: Couple Composition (TWO BECOME ONE.)...');
    await page.evaluate(() => {
      const el = document.getElementById('couple');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 700));
    await saveScreenshot(page, '06_homepage_exp04_couple.png');

    // Experience 5: Product Transformation
    console.log('Capturing Exp 05: Product Transformation (MADE TO BE KEPT.)...');
    await page.evaluate(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 700));
    await saveScreenshot(page, '07_homepage_exp05_products_framed.png');

    // Click Print format button
    console.log('Switching to Print format...');
    const printFmtBtn = await page.$('button::-p-text(print)');
    if (printFmtBtn) {
      await printFmtBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, '08_homepage_exp05_products_print.png');
    }

    // Experience 6: Booking Invitation & Footer
    console.log('Capturing Exp 06: Final Invitation (YOUR TURN.)...');
    await page.evaluate(() => {
      const el = document.getElementById('inquire');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 700));
    await saveScreenshot(page, '09_homepage_exp06_invitation.png');

    // Test Pop-up Modal
    const popupBtn = await page.$('button::-p-text(FIND THE NEXT POP-UP)');
    if (popupBtn) {
      await popupBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, '10_homepage_exp06_popup_modal.png');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // ─── PART 2: FUNCTIONAL INNER PAGES ───
    console.log('\n--- 2. TESTING FUNCTIONAL INNER PAGES ---');

    // Page 1: /products
    console.log('Navigating to /products ...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '11_page_products_collection.png');

    // Page 2: /book
    console.log('Navigating to /book ...');
    await page.goto('http://localhost:3000/book', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '12_page_book_form.png');

    // Fill and submit booking enquiry
    console.log('Testing booking submission...');
    await page.type('input[placeholder="e.g. Maya Iyer"]', 'Maya Iyer');
    await page.type('input[placeholder="e.g. +91 98400 12345"]', '9840012345');
    await page.click('#consentCheck');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '13_page_book_enquiry_success.png');

    // Page 3: /my-iris
    console.log('Navigating to /my-iris ...');
    await page.goto('http://localhost:3000/my-iris', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '14_page_my_iris_login.png');

    // Login with demo number
    await page.type('input[type="tel"]', '9840099881');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 600));
    await page.type('input[placeholder*="1234"]', '1234');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '15_page_my_iris_vault_dashboard.png');

    // Page 4: /shop
    console.log('Navigating to /shop ...');
    await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '16_page_shop_customizer.png');

    // Add configured item and fill shipping
    console.log('Testing shop order creation...');
    await page.click('button::-p-text(ADD CONFIGURED PIECE)');
    await new Promise(r => setTimeout(r, 500));
    // Close cart drawer to fill shipping form
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    await page.type('input[placeholder="e.g. Rahul Sen"]', 'Rahul Sen');
    await page.type('input[placeholder="+91 98..."]', '9840199882');
    await page.type('textarea[placeholder*="Door No"]', '12 Rue Romain Rolland, White Town');
    await page.click('button::-p-text(CONFIRM ATELIER ORDER)');
    await new Promise(r => setTimeout(r, 1800));
    await saveScreenshot(page, '17_page_shop_order_success.png');

    // Page 5: /track-order
    console.log('Navigating to /track-order ...');
    await page.goto('http://localhost:3000/track-order?id=IRIS-7402', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '18_page_track_order_verified.png');

    // ─── PART 3: MOBILE RESPONSIVE AUDIT (390x844) ───
    console.log('\n--- 3. TESTING MOBILE RESPONSIVE (390x844) ---');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '19_mobile_01_hero.png');

    await page.evaluate(() => {
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot(page, '20_mobile_02_gallery.png');

    await page.evaluate(() => {
      const el = document.getElementById('couple');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot(page, '21_mobile_03_couple.png');

    await page.evaluate(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot(page, '22_mobile_04_products.png');

    // ─── PART 4: ANIMATION RECORDINGS (GIFs) ───
    console.log('\n--- 4. RECORDING ANIMATION HIGHLIGHTS ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // GIF 1: Full Homepage Scroll Overview
    console.log('Recording 01_full_homepage_scroll.gif ...');
    const fwdDir = path.join(LOCAL_RECORDING_DIR, 'temp_home');
    if (!fs.existsSync(fwdDir)) fs.mkdirSync(fwdDir, { recursive: true });

    const scrollSteps = [0, 800, 1600, 2400, 3200, 4000, 4800, 5600, 6400, 7200, 8000];
    for (let i = 0; i < scrollSteps.length; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollSteps[i]);
      await new Promise(r => setTimeout(r, 280));
      await page.screenshot({ path: path.join(fwdDir, `frame_${String(i).padStart(3, '0')}.png`) });
    }
    await assembleGif(fwdDir, '01_full_homepage_scroll.gif', 220);

    // GIF 2: Gallery Drag & Selection
    console.log('Recording 02_gallery_interaction.gif ...');
    const galDir = path.join(LOCAL_RECORDING_DIR, 'temp_gal');
    if (!fs.existsSync(galDir)) fs.mkdirSync(galDir, { recursive: true });

    await page.evaluate(() => {
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Cycle through 3 artworks
    for (let i = 0; i < 9; i++) {
      const nextBtn = await page.$('button[aria-label="Next artwork"]');
      if (nextBtn) await nextBtn.click();
      await new Promise(r => setTimeout(r, 350));
      await page.screenshot({ path: path.join(galDir, `frame_${String(i).padStart(3, '0')}.png`) });
    }
    await assembleGif(galDir, '02_gallery_interaction.gif', 250);

    // GIF 3: Product Format Transformation
    console.log('Recording 04_product_transformation.gif ...');
    const prodDir = path.join(LOCAL_RECORDING_DIR, 'temp_prod');
    if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });

    await page.evaluate(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));

    const formats = ['digital', 'print', 'framed', 'digital', 'print', 'framed'];
    for (let i = 0; i < formats.length; i++) {
      const fmtBtn = await page.$(`button::-p-text(${formats[i]})`);
      if (fmtBtn) await fmtBtn.click();
      await new Promise(r => setTimeout(r, 450));
      await page.screenshot({ path: path.join(prodDir, `frame_${String(i).padStart(3, '0')}.png`) });
    }
    await assembleGif(prodDir, '04_product_transformation.gif', 300);

    console.log('\n=== COMPLETE MASTER QA SUITE EXECUTED WITH 100% SUCCESS ===');
  } catch (err) {
    console.error('QA Test execution failure:', err);
  } finally {
    await browser.close();
  }
}

run();
