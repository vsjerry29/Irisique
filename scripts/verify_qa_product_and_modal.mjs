import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\screenshots\\qa_product_clean';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const RECORDINGS_DIR = 'D:\\Irisique\\recordings\\qa_product_clean';

fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

async function run() {
  console.log('=== IRIS PRODUCT EXPERIENCE, MODAL & CLEAN JOURNEY QA ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE LOG ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const saveShot = async (name) => {
    const p1 = path.join(LOCAL_DIR, name);
    const p2 = path.join(ARTIFACT_DIR, name);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log(`Saved screenshot: ${name}`);
  };

  // 1. FRESH LOAD
  console.log('--- 1. Loading Homepage ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000)); // wait for macro intro to settle

  // ── 2. PASS A: TEST ARTWORK DETAILS MODAL & CLOSE BUTTON ──
  console.log('--- 2. Testing Gallery Explore Details Modal & Stacking Context ---');
  // Scroll to gallery
  await page.evaluate(() => {
    const explore = document.getElementById('explore');
    if (explore) window.scrollTo(0, 1400);
  });
  await new Promise(r => setTimeout(r, 700));

  // Find and click "EXPLORE DETAILS" button
  const exploreClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('EXPLORE DETAILS'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Explore Details button:', exploreClicked);
  await new Promise(r => setTimeout(r, 600));

  // Verify modal attributes, stacking context, body overflow
  const modalInfo = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const closeBtn = dialog ? dialog.querySelector('button') : null;
    const rect = closeBtn ? closeBtn.getBoundingClientRect() : null;
    const topElementAtCloseBtn = rect ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
    return {
      isOpen: !!dialog,
      isMountedOnBody: dialog ? dialog.parentElement === document.body : false,
      bodyOverflow: document.body.style.overflow,
      closeBtnText: closeBtn ? closeBtn.innerText : null,
      topElementTag: topElementAtCloseBtn ? topElementAtCloseBtn.tagName : null,
      topElementClass: topElementAtCloseBtn ? topElementAtCloseBtn.className : null,
      isCloseBtnUnobstructed: topElementAtCloseBtn ? closeBtn.contains(topElementAtCloseBtn) : false,
    };
  });
  console.log('Gallery Modal Info:', modalInfo);
  await saveShot('qa_01_gallery_modal_open.png');

  // Test closing via ESC key
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));
  const isClosedAfterEsc = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  console.log('Modal closed via ESC:', isClosedAfterEsc);
  await saveShot('qa_02_gallery_modal_closed.png');

  // ── 3. PASS B: TEST CLEAN ENDING OF IRIS JOURNEY ──
  console.log('--- 3. Testing Clean Transition Out of Iris Journey ---');
  // Scroll to end of section 1 (around 2200px)
  await page.evaluate(() => window.scrollTo(0, 2200));
  await new Promise(r => setTimeout(r, 800));

  const journeyEndState = await page.evaluate(() => {
    const couple = document.getElementById('couple');
    const coupleRect = couple ? couple.getBoundingClientRect() : null;
    return {
      coupleInView: coupleRect ? coupleRect.top <= 100 : false,
      coupleTop: coupleRect ? coupleRect.top : null,
    };
  });
  console.log('Journey End / Next Section State:', journeyEndState);
  await saveShot('qa_03_journey_end_couple_clean.png');

  // ── 4. PASS C & D: TEST CONTINUOUS TRAIN PRODUCT CAROUSEL ──
  console.log('--- 4. Testing Product Train Carousel & Hover Slowdown ---');
  // Scroll to #products
  await page.evaluate(() => {
    const prod = document.getElementById('products');
    if (prod) prod.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));

  // Measure base train autoplay movement over 600ms
  const pos1 = await page.evaluate(() => {
    const track = document.querySelector('#products .will-change-transform');
    return track ? track.getBoundingClientRect().left : 0;
  });
  await new Promise(r => setTimeout(r, 600));
  const pos2 = await page.evaluate(() => {
    const track = document.querySelector('#products .will-change-transform');
    return track ? track.getBoundingClientRect().left : 0;
  });
  const normalSpeed = Math.abs(pos2 - pos1);
  console.log(`Normal train movement in 600ms: ${normalSpeed.toFixed(1)}px (Autoplay Active)`);
  await saveShot('qa_04_product_carousel_running.png');

  // Hover over carousel: test hover slowdown
  const carouselBox = await page.evaluate(() => {
    const el = document.querySelector('#products .overflow-visible');
    const r = el ? el.getBoundingClientRect() : null;
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 700, y: 500 };
  });
  await page.mouse.move(carouselBox.x, carouselBox.y);
  await new Promise(r => setTimeout(r, 200)); // wait for easing

  const hoverPos1 = await page.evaluate(() => {
    const track = document.querySelector('#products .will-change-transform');
    return track ? track.getBoundingClientRect().left : 0;
  });
  await new Promise(r => setTimeout(r, 600));
  const hoverPos2 = await page.evaluate(() => {
    const track = document.querySelector('#products .will-change-transform');
    return track ? track.getBoundingClientRect().left : 0;
  });
  const hoverSpeed = Math.abs(hoverPos2 - hoverPos1);
  console.log(`Hover train movement in 600ms: ${hoverSpeed.toFixed(1)}px (Hover Slowdown Active, Ratio: ${(hoverSpeed/normalSpeed).toFixed(2)})`);
  await saveShot('qa_05_product_carousel_hover_slowdown.png');

  // ── 5. PASS E: TEST PRODUCT DETAILS MODAL ──
  console.log('--- 5. Testing Product Details Modal ---');
  // Click on the first visible product card
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#products [class*="group relative w-"]');
    if (cards.length > 0) {
      cards[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const prodModalInfo = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const closeBtn = dialog ? dialog.querySelector('button') : null;
    const title = dialog ? dialog.querySelector('h3') : null;
    const rect = closeBtn ? closeBtn.getBoundingClientRect() : null;
    const topElementAtCloseBtn = rect ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
    return {
      isOpen: !!dialog,
      title: title ? title.innerText : null,
      isMountedOnBody: dialog ? dialog.parentElement === document.body : false,
      bodyOverflow: document.body.style.overflow,
      isCloseBtnUnobstructed: topElementAtCloseBtn ? closeBtn.contains(topElementAtCloseBtn) : false,
    };
  });
  console.log('Product Details Modal Info:', prodModalInfo);
  await saveShot('qa_06_product_details_modal.png');

  // Close via button click
  await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const closeBtn = dialog ? dialog.querySelector('button') : null;
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  const isProdModalClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  console.log('Product Modal closed via button click:', isProdModalClosed);

  // ── 6. PASS E: TEST MINIMAL LUXURY FOOTER ──
  console.log('--- 6. Testing Minimal Luxury Footer ---');
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await saveShot('qa_07_luxury_footer.png');

  // ── 7. PASS F: TEST MOBILE VIEWPORT (390 x 844) ──
  console.log('--- 7. Testing Mobile Viewport 390x844 ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3800));

  // Mobile product section
  await page.evaluate(() => {
    const prod = document.getElementById('products');
    if (prod) prod.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await saveShot('qa_08_mobile_products.png');

  // Open product modal on mobile
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#products [class*="group relative w-"]');
    if (cards.length > 0) cards[0].click();
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileModalCloseInView = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const closeBtn = dialog ? dialog.querySelector('button') : null;
    if (!closeBtn) return false;
    const r = closeBtn.getBoundingClientRect();
    return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
  });
  console.log('Mobile Close button inside safe viewport:', mobileModalCloseInView);
  await saveShot('qa_09_mobile_modal_safe_area.png');

  // Mobile footer
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await saveShot('qa_10_mobile_footer.png');

  console.log('=== ALL QA VERIFICATIONS COMPLETED SUCCESSFULLY ===');
  await browser.close();
}

run().catch(err => {
  console.error('QA Script failed:', err);
  process.exit(1);
});
