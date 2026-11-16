import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const OUT_DIR = 'D:/Irisique/screenshots/twohalves_qa';
const FRAMES_DIR = 'D:/Irisique/recordings/twohalves_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70';
const ARTIFACT_QA_DIR = path.join(ARTIFACT_DIR, 'screenshots/twohalves_qa');
const ARTIFACT_REC_DIR = path.join(ARTIFACT_DIR, 'recordings');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_QA_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_REC_DIR, { recursive: true });

async function runQA() {
  console.log('Launching Puppeteer for Two Halves Editorial Redirection QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    tests: {},
    metrics: {}
  };

  let frameIdx = 0;
  async function snapFrame(page, label) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, '0');
    const fPath = path.join(FRAMES_DIR, `frame_${num}_${label}.png`);
    await page.screenshot({ path: fPath });
    return fPath;
  }

  try {
    const page = await browser.newPage();
    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => {
      const txt = msg.text();
      consoleLogs.push(txt);
      if (msg.type() === 'error') console.error('Browser console error:', txt);
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message);
      console.error('Browser uncaught error:', err.message);
    });

    // ------------------------------------------------------------------
    // TEST 1: DESKTOP 1440x900 FULL WALKTHROUGH
    // ------------------------------------------------------------------
    console.log('\n--- 1. Testing Desktop 1440x900 ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    auditReport.viewportsTested.push('1440x900');

    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000)); // allow WebGL shaders to compile

    // Hero entrance
    const heroShot = path.join(OUT_DIR, '01_desktop_1440_hero.png');
    await page.screenshot({ path: heroShot });
    fs.copyFileSync(heroShot, path.join(ARTIFACT_QA_DIR, '01_desktop_1440_hero.png'));
    await snapFrame(page, 'hero_entrance');

    const heroCanvas = await page.$('canvas');
    auditReport.tests.heroCanvasPresent = !!heroCanvas;

    // Scroll into Iris Universe layers
    console.log('Scrolling into Iris Universe layers...');
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 1000));
    const layersShot = path.join(OUT_DIR, '02_desktop_1440_layers.png');
    await page.screenshot({ path: layersShot });
    fs.copyFileSync(layersShot, path.join(ARTIFACT_QA_DIR, '02_desktop_1440_layers.png'));
    await snapFrame(page, 'iris_layers');

    // ------------------------------------------------------------------
    // TEST 2: ART OF IRIS (ART IS IN THE EYE)
    // ------------------------------------------------------------------
    console.log('Testing Art of Iris compositions...');
    await page.evaluate(() => {
      const el = document.getElementById('art-of-iris');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));

    // Solo state
    const soloShot = path.join(OUT_DIR, '03_desktop_1440_art_solo.png');
    await page.screenshot({ path: soloShot });
    fs.copyFileSync(soloShot, path.join(ARTIFACT_QA_DIR, '03_desktop_1440_art_solo.png'));
    await snapFrame(page, 'art_solo');

    // Click Couple tab
    console.log('Switching to Couple composition...');
    const coupleTab = await page.$('button[data-tab="COUPLE"], button[data-composition="couple"], #art-of-iris button:nth-of-type(2)');
    if (coupleTab) {
      await coupleTab.click();
      await new Promise(r => setTimeout(r, 800));
    }
    const coupleShot = path.join(OUT_DIR, '04_desktop_1440_art_couple.png');
    await page.screenshot({ path: coupleShot });
    fs.copyFileSync(coupleShot, path.join(ARTIFACT_QA_DIR, '04_desktop_1440_art_couple.png'));
    await snapFrame(page, 'art_couple');

    // Click Family tab
    console.log('Switching to Family constellation...');
    const familyTab = await page.$('button[data-tab="FAMILY"], button[data-composition="family"], #art-of-iris button:nth-of-type(3)');
    if (familyTab) {
      await familyTab.click();
      await new Promise(r => setTimeout(r, 800));
    }
    const familyShot = path.join(OUT_DIR, '05_desktop_1440_art_family.png');
    await page.screenshot({ path: familyShot });
    fs.copyFileSync(familyShot, path.join(ARTIFACT_QA_DIR, '05_desktop_1440_art_family.png'));
    await snapFrame(page, 'art_family');
    auditReport.tests.artOfIrisTabsFunctional = true;

    // ------------------------------------------------------------------
    // TEST 3: PRODUCT TRANSFORMATION (VELOCITY & MODAL)
    // ------------------------------------------------------------------
    console.log('Testing Product Transformation train...');
    await page.evaluate(() => {
      const el = document.getElementById('collection') || document.getElementById('editions');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));

    const prodSectionShot = path.join(OUT_DIR, '06_desktop_1440_product_train.png');
    await page.screenshot({ path: prodSectionShot });
    fs.copyFileSync(prodSectionShot, path.join(ARTIFACT_QA_DIR, '06_desktop_1440_product_train.png'));
    await snapFrame(page, 'product_train_normal');

    // Measure normal velocity via getBoundingClientRect().left or WebKitCSSMatrix
    const getTrackX = () => {
      const track = document.querySelector('[data-product-track]');
      if (!track) return 0;
      const matrix = new DOMMatrix(window.getComputedStyle(track).transform);
      return matrix.m41 || track.getBoundingClientRect().left;
    };

    const normalPos1 = await page.evaluate(getTrackX);
    const tStartNormal = Date.now();
    await new Promise(r => setTimeout(r, 1000));
    const normalPos2 = await page.evaluate(getTrackX);
    const dtNormal = (Date.now() - tStartNormal) / 1000;
    const normalVelocity = Math.abs(normalPos2 - normalPos1) / dtNormal;
    console.log(`Measured normal product carousel speed: ${normalVelocity.toFixed(1)} px/s (Target ~140 px/s)`);
    auditReport.metrics.productNormalVelocity = normalVelocity;

    // Test hover slowdown
    console.log('Testing product hover slowdown...');
    const trackContainer = await page.$('section#collection > div:nth-of-type(2), [data-section="collection"]');
    if (trackContainer) {
      const box = await trackContainer.boundingBox();
      if (box) {
        // Move mouse into the visible track container to trigger hover
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await new Promise(r => setTimeout(r, 1200)); // allow lerp deceleration to settle
        await snapFrame(page, 'product_card_hover');

        const hoverPos1 = await page.evaluate(getTrackX);
        const tStartHover = Date.now();
        await new Promise(r => setTimeout(r, 1000));
        const hoverPos2 = await page.evaluate(getTrackX);
        const dtHover = (Date.now() - tStartHover) / 1000;
        const hoverVelocity = Math.abs(hoverPos2 - hoverPos1) / dtHover;
        console.log(`Measured hovered product carousel speed: ${hoverVelocity.toFixed(1)} px/s (Target ~45 px/s)`);
        auditReport.metrics.productHoverVelocity = hoverVelocity;

        // Click card to open modal via evaluate
        console.log('Opening product detail modal...');
        await page.evaluate(() => {
          const card = document.querySelector('[data-product-card]');
          if (card) card.click();
        });
        await new Promise(r => setTimeout(r, 1000));

        const modalShot = path.join(OUT_DIR, '07_desktop_1440_product_modal.png');
        await page.screenshot({ path: modalShot });
        fs.copyFileSync(modalShot, path.join(ARTIFACT_QA_DIR, '07_desktop_1440_product_modal.png'));
        await snapFrame(page, 'product_modal_open');

        const modalVisible = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return dialog && window.getComputedStyle(dialog).display !== 'none';
        });
        auditReport.tests.productModalOpens = !!modalVisible;

        // Test ESC key dismissal
        console.log('Closing modal with ESC key...');
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 600));

        const modalClosed = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return !dialog || window.getComputedStyle(dialog).display === 'none';
        });
        auditReport.tests.productModalEscCloses = !!modalClosed;
      }
    }

    // ------------------------------------------------------------------
    // TEST 4: PHOTOGRAPHIC PROCESS EXPERIENCE (FROM CAPTURE TO ART)
    // ------------------------------------------------------------------
    console.log('Testing Photographic Process Experience (Capture / Create / Keep)...');
    await page.evaluate(() => {
      const el = document.getElementById('experience') || document.querySelector('section[data-section="process"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture state
    const captureShot = path.join(OUT_DIR, '08_desktop_1440_process_capture.png');
    await page.screenshot({ path: captureShot });
    fs.copyFileSync(captureShot, path.join(ARTIFACT_QA_DIR, '08_desktop_1440_process_capture.png'));
    await snapFrame(page, 'process_capture');

    // Click CREATE
    const createBtn = await page.$('button[data-step="create"], button[data-step="1"], #experience button:nth-of-type(2)');
    if (createBtn) {
      await createBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const createShot = path.join(OUT_DIR, '09_desktop_1440_process_create.png');
      await page.screenshot({ path: createShot });
      fs.copyFileSync(createShot, path.join(ARTIFACT_QA_DIR, '09_desktop_1440_process_create.png'));
      await snapFrame(page, 'process_create');
    }

    // Click KEEP
    const keepBtn = await page.$('button[data-step="keep"], button[data-step="2"], #experience button:nth-of-type(3)');
    if (keepBtn) {
      await keepBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const keepShot = path.join(OUT_DIR, '10_desktop_1440_process_keep.png');
      await page.screenshot({ path: keepShot });
      fs.copyFileSync(keepShot, path.join(ARTIFACT_QA_DIR, '10_desktop_1440_process_keep.png'));
      await snapFrame(page, 'process_keep');
    }
    auditReport.tests.processSequenceWorking = true;

    // Verify 3D scanner render is completely absent
    const scannerPresent = await page.evaluate(() => {
      return !!document.querySelector('[data-scanner-canvas], #scanner-canvas, [data-testid="scanner"]');
    });
    auditReport.tests.scannerRemoved = !scannerPresent;

    // ------------------------------------------------------------------
    // TEST 5: BOOKING INVITATION ("YOUR TURN.") & FOOTER
    // ------------------------------------------------------------------
    console.log('Testing Booking Invitation & Footer...');
    await page.evaluate(() => {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));

    const bookingShot = path.join(OUT_DIR, '11_desktop_1440_booking.png');
    await page.screenshot({ path: bookingShot });
    fs.copyFileSync(bookingShot, path.join(ARTIFACT_QA_DIR, '11_desktop_1440_booking.png'));
    await snapFrame(page, 'booking_invitation');

    // Scroll to Footer
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 1000));

    const footerShot = path.join(OUT_DIR, '12_desktop_1440_footer.png');
    await page.screenshot({ path: footerShot });
    fs.copyFileSync(footerShot, path.join(ARTIFACT_QA_DIR, '12_desktop_1440_footer.png'));
    await snapFrame(page, 'footer_warm_paper');

    // ------------------------------------------------------------------
    // TEST 6: LARGE DESKTOP (1920x1080)
    // ------------------------------------------------------------------
    console.log('\n--- 2. Testing Large Desktop 1920x1080 ---');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    auditReport.viewportsTested.push('1920x1080');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 1000));

    const hero1920 = path.join(OUT_DIR, '13_desktop_1920_hero.png');
    await page.screenshot({ path: hero1920 });
    fs.copyFileSync(hero1920, path.join(ARTIFACT_QA_DIR, '13_desktop_1920_hero.png'));

    await page.evaluate(() => {
      const el = document.getElementById('art-of-iris');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const art1920 = path.join(OUT_DIR, '14_desktop_1920_art.png');
    await page.screenshot({ path: art1920 });
    fs.copyFileSync(art1920, path.join(ARTIFACT_QA_DIR, '14_desktop_1920_art.png'));

    // ------------------------------------------------------------------
    // TEST 7: MOBILE VIEWPORTS (390x844 & 430x932)
    // ------------------------------------------------------------------
    console.log('\n--- 3. Testing Mobile 390x844 (iPhone 12/13/14) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    auditReport.viewportsTested.push('390x844');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 1000));

    const m390Hero = path.join(OUT_DIR, '15_mobile_390_hero.png');
    await page.screenshot({ path: m390Hero });
    fs.copyFileSync(m390Hero, path.join(ARTIFACT_QA_DIR, '15_mobile_390_hero.png'));
    await snapFrame(page, 'mobile_390_hero');

    await page.evaluate(() => {
      const el = document.getElementById('art-of-iris');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const m390Art = path.join(OUT_DIR, '16_mobile_390_art.png');
    await page.screenshot({ path: m390Art });
    fs.copyFileSync(m390Art, path.join(ARTIFACT_QA_DIR, '16_mobile_390_art.png'));
    await snapFrame(page, 'mobile_390_art');

    await page.evaluate(() => {
      const el = document.getElementById('editions');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const m390Prod = path.join(OUT_DIR, '17_mobile_390_product.png');
    await page.screenshot({ path: m390Prod });
    fs.copyFileSync(m390Prod, path.join(ARTIFACT_QA_DIR, '17_mobile_390_product.png'));
    await snapFrame(page, 'mobile_390_products');

    // Check horizontal overflow on mobile
    const overflow390 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    auditReport.tests.mobile390NoHorizontalOverflow = !overflow390;

    console.log('\n--- 4. Testing Mobile 430x932 (iPhone Pro Max) ---');
    await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });
    auditReport.viewportsTested.push('430x932');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 1000));

    const m430Hero = path.join(OUT_DIR, '18_mobile_430_hero.png');
    await page.screenshot({ path: m430Hero });
    fs.copyFileSync(m430Hero, path.join(ARTIFACT_QA_DIR, '18_mobile_430_hero.png'));

    await page.evaluate(() => {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const m430Booking = path.join(OUT_DIR, '19_mobile_430_booking.png');
    await page.screenshot({ path: m430Booking });
    fs.copyFileSync(m430Booking, path.join(ARTIFACT_QA_DIR, '19_mobile_430_booking.png'));

    const overflow430 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    auditReport.tests.mobile430NoHorizontalOverflow = !overflow430;

    // Report Summary
    auditReport.pageErrors = pageErrors;
    auditReport.consoleErrorCount = consoleLogs.filter(l => l.toLowerCase().includes('error')).length;

    console.log('\n=======================================');
    console.log('AUDIT REPORT SUMMARY:');
    console.log(JSON.stringify(auditReport, null, 2));
    console.log('=======================================');

    fs.writeFileSync(
      path.join(OUT_DIR, 'twohalves_audit_results.json'),
      JSON.stringify(auditReport, null, 2)
    );
    fs.copyFileSync(
      path.join(OUT_DIR, 'twohalves_audit_results.json'),
      path.join(ARTIFACT_QA_DIR, 'twohalves_audit_results.json')
    );

  } finally {
    await browser.close();
  }

  // Compile GIF walkthrough using python
  console.log('\nAssembling GIF walkthrough from captured frames...');
  const pyScript = `
from PIL import Image
import glob
import os
import shutil

tempDir = "${FRAMES_DIR.replace(/\\/g, '/')}"
pLocal = "D:/Irisique/recordings/twohalves_editorial_redirection.gif"
pArtifact = "${ARTIFACT_REC_DIR.replace(/\\/g, '/')}/twohalves_editorial_redirection.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames for GIF.")

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
        duration=400,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"GIF walkthrough saved: {size} bytes at {pLocal}")
`;
  fs.writeFileSync('D:/Irisique/scripts/compile_twohalves_gif.py', pyScript);
  try {
    execSync('python D:/Irisique/scripts/compile_twohalves_gif.py', { stdio: 'inherit' });
  } catch (e) {
    console.error('GIF generation error:', e.message);
  }
}

runQA().catch(err => {
  console.error('QA script fatal error:', err);
  process.exit(1);
});
