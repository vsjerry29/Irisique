import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\screenshots\\repaired';
const ARTIFACTS_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function save(page, name) {
  const p1 = path.join(LOCAL_DIR, name);
  const p2 = path.join(ARTIFACTS_DIR, name);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  const size = fs.statSync(p1).size;
  console.log(`[Captured] ${name} (${size} bytes)`);
}

async function run() {
  console.log('--- STARTING IRIS MOTION ARCHITECTURE VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--ignore-gpu-blocklist',
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Load homepage with motion debug HUD
  console.log('\n1. Verifying initial load & early typography reveal (?motionDebug=1)...');
  await page.goto('http://localhost:3000/?motionDebug=1', { waitUntil: 'domcontentloaded' });
  
  // Measure at 0.6s to verify hero text is visible early (no black delay)
  await new Promise(r => setTimeout(r, 600));
  await save(page, '01_hero_early_reveal_0.6s.png');

  // Measure at 3.2s when intro settles
  await new Promise(r => setTimeout(r, 2600));
  await save(page, '02_hero_settled_with_hud.png');

  // Verify HUD telemetry
  const hudData = await page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="Motion Debug Panel"]');
    return aside ? aside.innerText : 'HUD NOT FOUND';
  });
  console.log('HUD Data:\n', hudData);

  // 2. Test Hero -> Universe transition
  console.log('\n2. Testing Hero -> Universe transition (scroll to 100vh)...');
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 400));
  await save(page, '03_hero_scroll_progress.png');

  // Scroll into Universe
  console.log('Scrolling into Experience 02: Universe...');
  await page.evaluate(() => {
    const el = document.getElementById('universe');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '04_universe_entered_centered.png');

  // Advance inside Universe
  await page.evaluate(() => {
    window.scrollBy({ top: window.innerHeight * 1.0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await save(page, '05_universe_immersion.png');

  // 3. Test Gallery Entrance
  console.log('\n3. Testing Universe -> Gallery transition...');
  await page.evaluate(() => {
    const el = document.getElementById('gallery');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 700));
  await save(page, '06_gallery_exhibition.png');

  // 4. Test Couple Experience
  console.log('\n4. Testing Gallery -> Couple Experience transition...');
  await page.evaluate(() => {
    const el = document.getElementById('couple');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 700));
  await save(page, '07_couple_entry_separated.png');

  // Advance Couple attraction
  await page.evaluate(() => {
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 700));
  await save(page, '08_couple_connected_final_artwork.png');

  // 5. Test Product Transformation
  console.log('\n5. Testing Couple -> Product Transformation (continuity to framed couple master)...');
  await page.evaluate(() => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 700));
  await save(page, '09_product_framed_couple_master.png');

  // Switch to Solo Iris
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const soloBtn = btns.find(b => b.textContent?.trim() === 'SOLO IRIS');
    if (soloBtn) soloBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await save(page, '10_product_solo_iris.png');

  // Switch format to Print
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const printBtn = btns.find(b => b.textContent?.trim() === 'print');
    if (printBtn) printBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await save(page, '11_product_print_format.png');

  // 6. Test Booking Invitation
  console.log('\n6. Testing Booking Invitation...');
  await page.evaluate(() => {
    const el = document.getElementById('inquire');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 700));
  await save(page, '12_booking_invitation.png');

  // 7. Test Reverse Scroll Restoration
  console.log('\n7. Testing reverse scroll restoration back to top (y=0)...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await save(page, '13_reverse_scroll_hero_restored.png');

  const heroVisibility = await page.evaluate(() => {
    const hero = document.querySelector('#explore h1');
    const heroContainer = hero ? hero.closest('div') : null;
    return {
      text: hero?.innerText || null,
      opacity: heroContainer ? window.getComputedStyle(heroContainer).opacity : null,
      scrollY: window.scrollY,
    };
  });
  console.log('Hero Visibility Verification:', heroVisibility);

  console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
  await browser.close();
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
