import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\screenshots\\final_qa';
const ARTIFACTS_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function saveScreenshot(page, filename) {
  const p1 = path.join(LOCAL_DIR, filename);
  const p2 = path.join(ARTIFACTS_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  const size = fs.statSync(p1).size;
  console.log(`[PASS] Captured ${filename} (${size} bytes)`);
}

async function runVisualQA() {
  console.log('=== STARTING IRIS COMPREHENSIVE VISUAL QA & VERIFICATION ===\n');

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

  // ──────────────────────────────────────────────────────────
  // 1. DESKTOP 1440x900 AUDIT
  // ──────────────────────────────────────────────────────────
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  console.log('--- 1. Testing Desktop 1440x900 ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2200));

  // Check 1: Hero Settled
  await saveScreenshot(page, 'qa_01_desktop_hero_settled.png');

  // Verify Replay button is visible on hero
  const replayVisibleOnHero = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const r = btns.find(b => b.innerText.includes('REPLAY'));
    return r ? window.getComputedStyle(r).display !== 'none' : false;
  });
  console.log(`Replay button visible in hero: ${replayVisibleOnHero}`);

  // Check 2: Hero scroll progress (text fading, iris organic response)
  await page.evaluate(() => window.scrollTo(0, 500));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_02_desktop_hero_scroll_fadeout.png');

  // Check 3: Transition Hero -> Iris Universe (y = 1980)
  await page.evaluate(() => window.scrollTo(0, 1980));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_03_desktop_universe_entry_centered.png');

  // Check 4: Iris Universe fly-through (y = 2650)
  await page.evaluate(() => window.scrollTo(0, 2650));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_04_desktop_universe_flight.png');

  // Check 5: Iris Universe dispersion into deep space (y = 3300)
  await page.evaluate(() => window.scrollTo(0, 3300));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_05_desktop_universe_dispersion.png');

  // Check 6: Transition Universe -> Gallery (y = 3800)
  await page.evaluate(() => window.scrollTo(0, 3800));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_06_desktop_gallery_entry.png');

  // Check 7: Gallery center stage (y = 4400)
  await page.evaluate(() => window.scrollTo(0, 4400));
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_07_desktop_gallery_active_amber.png');

  // Verify Replay button is NOT visible in gallery
  const replayVisibleInGallery = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const r = btns.find(b => b.innerText.includes('REPLAY'));
    return r ? window.getComputedStyle(r).display !== 'none' : false;
  });
  console.log(`Replay button hidden in gallery: ${!replayVisibleInGallery}`);

  // Drag interaction in gallery
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.getAttribute('aria-label') === 'Next artwork');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, 'qa_08_desktop_gallery_switched_sapphire.png');

  // Check 8: Transition Gallery -> Couple Experience (y = 5153)
  // Gallery exits cleanly, Couple enters separated with ZERO overlap
  await page.evaluate(() => window.scrollTo(0, 5153));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_09_desktop_couple_entry_separated.png');

  // Check 9: Couple attraction mid-point (y = 5600)
  await page.evaluate(() => window.scrollTo(0, 5600));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_10_desktop_couple_attraction.png');

  // Check 10: Couple connected into final artwork (y = 6000)
  await page.evaluate(() => window.scrollTo(0, 6000));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_11_desktop_couple_merged_artwork.png');

  // Check 11: Transition Couple -> Products (y = 6600)
  // Couple heading fades out cleanly, NO black gap, Products enters
  await page.evaluate(() => window.scrollTo(0, 6600));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_12_desktop_transition_couple_to_products.png');

  // Check 12: Products Showcase (y = 7133)
  await page.evaluate(() => window.scrollTo(0, 7133));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, 'qa_13_desktop_products_framed_couple.png');

  // Toggle to Solo Iris & Print in Products
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const solo = btns.find(b => b.innerText.includes('SOLO IRIS'));
    if (solo) solo.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await saveScreenshot(page, 'qa_14_desktop_products_solo_iris.png');

  // Check 13: Transition Products -> Final Booking & Footer (y = 8033)
  await page.evaluate(() => window.scrollTo(0, 8033));
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_15_desktop_booking_invitation_footer.png');

  // Check 14: Reverse Scroll Restoration (scroll back to top y = 0)
  console.log('\n--- Testing Reverse Scroll Restoration ---');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, 'qa_16_desktop_reverse_scroll_restored.png');

  const heroRestoration = await page.evaluate(() => {
    const h1 = document.querySelector('#explore h1');
    const container = h1?.closest('div');
    return {
      title: h1?.innerText.replace('\n', ' '),
      opacity: container ? window.getComputedStyle(container).opacity : null,
      scrollY: window.scrollY
    };
  });
  console.log('Hero Restoration Status:', heroRestoration);

  // ──────────────────────────────────────────────────────────
  // 2. MOBILE 390x844 AUDIT (iPhone 14)
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Mobile 390x844 ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  await saveScreenshot(page, 'qa_17_mobile_hero.png');

  // Scroll into Universe
  await page.evaluate(() => {
    const u = document.getElementById('universe');
    if (u) u.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_18_mobile_universe.png');

  // Scroll into Gallery
  await page.evaluate(() => {
    const g = document.getElementById('gallery');
    if (g) g.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_19_mobile_gallery.png');

  // Scroll into Couple
  await page.evaluate(() => {
    const c = document.getElementById('couple');
    if (c) c.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_20_mobile_couple.png');

  // Scroll into Products
  await page.evaluate(() => {
    const p = document.getElementById('products');
    if (p) p.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_21_mobile_products.png');

  // Scroll into Booking
  await page.evaluate(() => {
    const i = document.getElementById('inquire');
    if (i) i.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, 'qa_22_mobile_booking.png');

  console.log('\n=== VISUAL QA SUITE FINISHED SUCCESSFULLY ===');
  await browser.close();
}

runVisualQA().catch(err => {
  console.error('Visual QA failed:', err);
  process.exit(1);
});
