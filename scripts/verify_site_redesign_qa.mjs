import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const OUT_DIR = 'D:/Irisique/screenshots/redesign_qa';
const FRAMES_DIR = 'D:/Irisique/recordings/redesign_qa_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70';
const ARTIFACT_QA_DIR = path.join(ARTIFACT_DIR, 'screenshots/redesign_qa');
const ARTIFACT_REC_DIR = path.join(ARTIFACT_DIR, 'recordings');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_QA_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_REC_DIR, { recursive: true });

async function runMasterQA() {
  console.log('Launching Puppeteer for Complete Website Redesign QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    routesTested: [],
    popupsTested: {},
    formsTested: {},
    metrics: {},
    pageErrors: [],
    consoleErrors: 0
  };

  let frameIdx = 0;
  async function snap(page, label) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, '0');
    const fPath = path.join(FRAMES_DIR, `frame_${num}_${label}.png`);
    await page.screenshot({ path: fPath });
    return fPath;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser error:', msg.text());
        auditReport.consoleErrors++;
      }
    });

    page.on('pageerror', err => {
      console.error('Page error:', err.message);
      auditReport.pageErrors.push(err.message);
    });

    // ------------------------------------------------------------------
    // TEST 1: HOMEPAGE & ARTWORK POPUP REPAIR
    // ------------------------------------------------------------------
    console.log('\n--- 1. Testing Homepage & Redesigned Artwork Popup ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    auditReport.routesTested.push('/');

    // Hero entrance
    await snap(page, 'home_hero');

    // Scroll to Art Section
    await page.evaluate(() => {
      const el = document.getElementById('art');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));
    await snap(page, 'home_art_section');

    // Click Family composition
    console.log('Testing Family artwork selection...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-tab="FAMILY"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Open Artwork Popup
    console.log('Opening Redesigned Artwork Popup...');
    await page.evaluate(() => {
      const plate = document.querySelector('[data-artwork-plate]');
      if (plate) plate.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const popupShot = path.join(OUT_DIR, '01_artwork_popup_family.png');
    await page.screenshot({ path: popupShot });
    fs.copyFileSync(popupShot, path.join(ARTIFACT_QA_DIR, '01_artwork_popup_family.png'));
    await snap(page, 'artwork_popup_family');

    // Verify Popup Properties
    const popupData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { open: false };
      const computedBg = window.getComputedStyle(dialog).backgroundColor;
      const text = dialog.innerText;
      const hasClose = !!dialog.querySelector('button[aria-label*="Close"], button:has(svg)');
      const h3 = dialog.querySelector('h3');
      const textColor = h3 ? window.getComputedStyle(h3).color : '';
      return {
        open: true,
        computedBg,
        textColor,
        hasNoHeritageJargon: !text.includes('Generational Heritage Matrix') && !text.includes('Biometric Bespoke'),
        hasClose
      };
    });
    console.log('Artwork Popup Verification:', popupData);
    auditReport.popupsTested.artworkPopup = popupData;

    // Test ESC Key Dismissal
    console.log('Closing Artwork Popup with ESC key...');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));

    // ------------------------------------------------------------------
    // TEST 2: FULLSCREEN TYPOGRAPHIC CURTAIN NAVIGATION
    // ------------------------------------------------------------------
    console.log('\n--- 2. Testing Typographic Curtain Navigation ---');
    await page.evaluate(() => {
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('MENU'));
      if (menuBtn) menuBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const menuShot = path.join(OUT_DIR, '02_typographic_curtain_menu.png');
    await page.screenshot({ path: menuShot });
    fs.copyFileSync(menuShot, path.join(ARTIFACT_QA_DIR, '02_typographic_curtain_menu.png'));
    await snap(page, 'menu_curtain');

    const menuLinksCount = await page.evaluate(() => {
      const links = document.querySelectorAll('[role="dialog"] a[href]');
      return links.length;
    });
    console.log(`Verified Menu Links: ${menuLinksCount} links present`);
    auditReport.popupsTested.menuOverlay = { open: true, linksCount: menuLinksCount };

    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // ------------------------------------------------------------------
    // TEST 3: REDESIGNED BOOKING PAGE (/book)
    // ------------------------------------------------------------------
    console.log('\n--- 3. Testing Redesigned Booking Page (/book) ---');
    await page.goto(`${BASE_URL}/book`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    auditReport.routesTested.push('/book');

    const bookInitialShot = path.join(OUT_DIR, '03_book_page_initial.png');
    await page.screenshot({ path: bookInitialShot });
    fs.copyFileSync(bookInitialShot, path.join(ARTIFACT_QA_DIR, '03_book_page_initial.png'));
    await snap(page, 'book_page_initial');

    // Verify exactly 4 primary fields
    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('form input'));
      const textLabels = Array.from(document.querySelectorAll('form label')).map(l => l.innerText);
      const isIvory = window.getComputedStyle(document.body).backgroundColor !== 'rgb(3, 4, 5)';
      const h1 = document.querySelector('h1')?.innerText;
      return {
        inputCount: inputs.length,
        textLabels,
        isIvory,
        h1
      };
    });
    console.log('Booking Form Structure:', formFields);
    auditReport.formsTested.bookingFormFields = formFields;

    // Test form interaction: Fill name, mobile, stepper, date
    console.log('Filling 4-field booking request form...');
    await page.type('#name', 'Rohit Sharma');
    await page.type('#mobile', '9840012345');
    // Click stepper + twice (people -> 3)
    await page.evaluate(() => {
      const plusBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '+');
      if (plusBtn) {
        plusBtn.click();
        plusBtn.click();
      }
    });

    // Set future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    await page.evaluate((d) => {
      const dateInput = document.getElementById('date');
      if (dateInput) {
        dateInput.value = d;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, dateStr);

    await snap(page, 'book_form_filled');

    // Submit Request
    console.log('Submitting booking request...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('form button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const bookSubmittedShot = path.join(OUT_DIR, '04_book_page_submitted.png');
    await page.screenshot({ path: bookSubmittedShot });
    fs.copyFileSync(bookSubmittedShot, path.join(ARTIFACT_QA_DIR, '04_book_page_submitted.png'));
    await snap(page, 'book_submitted');

    const submitResult = await page.evaluate(() => {
      const text = document.body.innerText;
      const waLink = document.querySelector('a[href*="wa.me"]');
      return {
        successHeadline: text.includes('THANK YOU'),
        hasWhatsAppAction: !!waLink,
        isEnquiryDisclaimer: text.includes('awaiting studio confirmation') || text.includes('enquiry')
      };
    });
    console.log('Booking Submission Result:', submitResult);
    auditReport.formsTested.bookingSubmitResult = submitResult;

    // ------------------------------------------------------------------
    // TEST 4: REDESIGNED SHOP PAGE (/shop) & PAPER SHUTTER
    // ------------------------------------------------------------------
    console.log('\n--- 4. Testing Redesigned Shop Page (/shop) & Paper Shutter ---');
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    auditReport.routesTested.push('/shop');

    const shopShot = path.join(OUT_DIR, '05_shop_page.png');
    await page.screenshot({ path: shopShot });
    fs.copyFileSync(shopShot, path.join(ARTIFACT_QA_DIR, '05_shop_page.png'));
    await snap(page, 'shop_page');

    // Click first product to open Paper Shutter
    console.log('Opening Paper Shutter product modal...');
    await page.evaluate(() => {
      const firstArticle = document.querySelector('article');
      if (firstArticle) firstArticle.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const shutterShot = path.join(OUT_DIR, '06_shop_paper_shutter.png');
    await page.screenshot({ path: shutterShot });
    fs.copyFileSync(shutterShot, path.join(ARTIFACT_QA_DIR, '06_shop_paper_shutter.png'));
    await snap(page, 'paper_shutter_open');

    // Click "Add to Atelier Order"
    console.log('Adding product to cart...');
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ADD TO ATELIER ORDER'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await snap(page, 'product_added_notice');

    // ------------------------------------------------------------------
    // TEST 5: REDESIGNED PRODUCTS PAGE (/products)
    // ------------------------------------------------------------------
    console.log('\n--- 5. Testing Redesigned Products Catalogue (/products) ---');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    auditReport.routesTested.push('/products');

    const productsShot = path.join(OUT_DIR, '07_products_catalogue.png');
    await page.screenshot({ path: productsShot });
    fs.copyFileSync(productsShot, path.join(ARTIFACT_QA_DIR, '07_products_catalogue.png'));
    await snap(page, 'products_catalogue');

    // ------------------------------------------------------------------
    // TEST 6: REDESIGNED MY IRIS (/my-iris)
    // ------------------------------------------------------------------
    console.log('\n--- 6. Testing Redesigned My Iris (/my-iris) ---');
    await page.goto(`${BASE_URL}/my-iris`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    auditReport.routesTested.push('/my-iris');

    const myIrisAuthShot = path.join(OUT_DIR, '08_my_iris_auth.png');
    await page.screenshot({ path: myIrisAuthShot });
    fs.copyFileSync(myIrisAuthShot, path.join(ARTIFACT_QA_DIR, '08_my_iris_auth.png'));
    await snap(page, 'my_iris_auth');

    // Enter mobile & verify code
    console.log('Logging into My Iris private client gallery...');
    await page.type('input[type="tel"]', '9840099881');
    await page.evaluate(() => {
      const btn = document.querySelector('form button[type="submit"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    await page.type('input[maxlength="6"]', '123456');
    await page.evaluate(() => {
      const btn = document.querySelector('form button[type="submit"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const myIrisGalleryShot = path.join(OUT_DIR, '09_my_iris_private_gallery.png');
    await page.screenshot({ path: myIrisGalleryShot });
    fs.copyFileSync(myIrisGalleryShot, path.join(ARTIFACT_QA_DIR, '09_my_iris_private_gallery.png'));
    await snap(page, 'my_iris_gallery');

    // ------------------------------------------------------------------
    // TEST 7: REDESIGNED TRACK ORDER (/track-order)
    // ------------------------------------------------------------------
    console.log('\n--- 7. Testing Redesigned Track Order (/track-order) ---');
    await page.goto(`${BASE_URL}/track-order?id=IRIS-7402`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    auditReport.routesTested.push('/track-order');

    const trackOrderShot = path.join(OUT_DIR, '10_track_order_status.png');
    await page.screenshot({ path: trackOrderShot });
    fs.copyFileSync(trackOrderShot, path.join(ARTIFACT_QA_DIR, '10_track_order_status.png'));
    await snap(page, 'track_order');

    // ------------------------------------------------------------------
    // TEST 8: MOBILE VIEWPORT VERIFICATION (390x844)
    // ------------------------------------------------------------------
    console.log('\n--- 8. Testing Mobile Responsiveness (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const mHomeShot = path.join(OUT_DIR, '11_mobile_390_home.png');
    await page.screenshot({ path: mHomeShot });
    fs.copyFileSync(mHomeShot, path.join(ARTIFACT_QA_DIR, '11_mobile_390_home.png'));
    await snap(page, 'mobile_home');

    await page.goto(`${BASE_URL}/book`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const mBookShot = path.join(OUT_DIR, '12_mobile_390_book.png');
    await page.screenshot({ path: mBookShot });
    fs.copyFileSync(mBookShot, path.join(ARTIFACT_QA_DIR, '12_mobile_390_book.png'));
    await snap(page, 'mobile_book');

    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Mobile Horizontal Overflow Check: ${mobileOverflow ? 'FAILED' : 'PASSED (no overflow)'}`);
    auditReport.metrics.mobileNoOverflow = !mobileOverflow;

    console.log('\n=======================================');
    console.log('COMPLETE REDESIGN AUDIT SUMMARY:');
    console.log(JSON.stringify(auditReport, null, 2));
    console.log('=======================================');

    fs.writeFileSync(
      path.join(OUT_DIR, 'redesign_audit_summary.json'),
      JSON.stringify(auditReport, null, 2)
    );
    fs.copyFileSync(
      path.join(OUT_DIR, 'redesign_audit_summary.json'),
      path.join(ARTIFACT_QA_DIR, 'redesign_audit_summary.json')
    );

  } finally {
    await browser.close();
  }

  // Compile Master GIF Walkthrough
  console.log('\nAssembling Master Walkthrough GIF...');
  const pyScript = `
from PIL import Image
import glob
import os
import shutil

tempDir = "${FRAMES_DIR.replace(/\\/g, '/')}"
pLocal = "D:/Irisique/recordings/complete_redesign_walkthrough.gif"
pArtifact = "${ARTIFACT_REC_DIR.replace(/\\/g, '/')}/complete_redesign_walkthrough.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames for Master Redesign GIF.")

imgs = []
for f in frames:
    im = Image.open(f)
    im.thumbnail((800, 500), Image.Resampling.LANCZOS)
    imgs.append(im)

if imgs:
    os.makedirs(os.path.dirname(pLocal), exist_ok=True)
    os.makedirs(os.path.dirname(pArtifact), exist_ok=True)
    imgs[0].save(
        pLocal,
        save_all=True,
        append_images=imgs[1:],
        duration=450,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"Master Redesign GIF saved: {size} bytes at {pLocal}")
`;
  fs.writeFileSync('D:/Irisique/scripts/compile_master_redesign_gif.py', pyScript);
  try {
    execSync('python D:/Irisique/scripts/compile_master_redesign_gif.py', { stdio: 'inherit' });
  } catch (e) {
    console.error('GIF compile error:', e.message);
  }
}

runMasterQA().catch(err => {
  console.error('Master QA error:', err);
  process.exit(1);
});
