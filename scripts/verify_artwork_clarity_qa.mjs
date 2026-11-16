import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const OUT_DIR = 'D:/Irisique/screenshots/artwork_qa';
const FRAMES_DIR = 'D:/Irisique/recordings/artwork_qa_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70';
const ARTIFACT_QA_DIR = path.join(ARTIFACT_DIR, 'screenshots/artwork_qa');
const ARTIFACT_REC_DIR = path.join(ARTIFACT_DIR, 'recordings');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_QA_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_REC_DIR, { recursive: true });

async function runQA() {
  console.log('--- Starting IRIS Artwork Clarity & Optical Thread QA ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const report = {
    timestamp: new Date().toISOString(),
    metrics: {},
    pairs: {},
    opticalThread: {},
    headingClipping: {},
    mobileAudit: {}
  };

  let frameCount = 0;
  async function capture(page, name) {
    frameCount++;
    const num = String(frameCount).padStart(3, '0');
    const localPath = path.join(OUT_DIR, `${name}.png`);
    const framePath = path.join(FRAMES_DIR, `frame_${num}_${name}.png`);
    const artifactPath = path.join(ARTIFACT_QA_DIR, `${name}.png`);

    await page.screenshot({ path: localPath });
    fs.copyFileSync(localPath, framePath);
    fs.copyFileSync(localPath, artifactPath);
    console.log(`Saved screenshot: ${name}.png`);
    return localPath;
  }

  try {
    // ═══════════════════════════════════════════════════════════
    // TEST 1: DESKTOP 1440x900 - GALLERY ENTRANCE & HEADING
    // ═══════════════════════════════════════════════════════════
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll gently down to #art entrance
    await page.evaluate(() => {
      const art = document.getElementById('art');
      if (art) {
        const top = art.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 100, behavior: 'instant' });
      }
    });
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '01_gallery_entrance_desktop1440');

    // Check heading visibility at entrance
    const headingEntranceProps = await page.evaluate(() => {
      const h2 = document.querySelector('#art h2');
      if (!h2) return null;
      const rect = h2.getBoundingClientRect();
      const style = window.getComputedStyle(h2);
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        opacity: style.opacity,
        isClippedTop: rect.top < 0,
      };
    });
    report.headingClipping.entrance = headingEntranceProps;

    // Scroll to center the gallery artwork stage
    await page.evaluate(() => {
      const plate = document.querySelector('[data-artwork-plate="true"]');
      if (plate) {
        plate.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '02_gallery_midpoint_solo_artwork');

    // Measure Solo Main Gallery properties
    const soloMainProps = await page.evaluate(() => {
      const plate = document.querySelector('[data-artwork-plate="true"]');
      const img = plate ? plate.querySelector('img') : null;
      const stage = plate ? plate.parentElement : null;
      const h2 = document.querySelector('#art h2');
      const thread = document.querySelector('[data-optical-thread="gallery"]');

      function s(el) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          opacity: cs.opacity,
          filter: cs.filter,
          display: cs.display,
          visibility: cs.visibility,
          transform: cs.transform
        };
      }

      return {
        stageStyle: s(stage),
        plateStyle: s(plate),
        imgStyle: s(img),
        imgSrc: img ? img.src : null,
        imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null,
        threadVisible: !!thread,
        threadStyle: s(thread),
        headingRect: h2 ? h2.getBoundingClientRect() : null,
        headingStyle: s(h2),
      };
    });
    report.pairs.soloMain = soloMainProps;

    // Capture Solo Artwork close crop for direct visual parity check
    const soloPlateEl = await page.$('[data-artwork-plate="true"]');
    if (soloPlateEl) {
      const box = await soloPlateEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_solo_gallery.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_solo_gallery.png'), path.join(ARTIFACT_QA_DIR, 'crop_solo_gallery.png'));
    }

    // Open Fullscreen Popup for Solo
    await page.click('[data-explore-btn="true"]');
    await new Promise(r => setTimeout(r, 600));
    await capture(page, '03_solo_fullscreen_popup');

    // Measure Solo Popup properties
    const soloPopupProps = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const img = dialog ? dialog.querySelector('img') : null;
      function s(el) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          opacity: cs.opacity,
          filter: cs.filter,
          transform: cs.transform
        };
      }
      return {
        dialogStyle: s(dialog),
        imgStyle: s(img),
        imgSrc: img ? img.src : null,
        imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null,
      };
    });
    report.pairs.soloPopup = soloPopupProps;

    // Capture Solo Popup artwork crop
    const popupImgEl = await page.$('[role="dialog"] img');
    if (popupImgEl) {
      const box = await popupImgEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_solo_popup.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_solo_popup.png'), path.join(ARTIFACT_QA_DIR, 'crop_solo_popup.png'));
    }

    // Close Popup with ESC key
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // ═══════════════════════════════════════════════════════════
    // TEST 2: SWITCH TO COUPLE COMPOSITION
    // ═══════════════════════════════════════════════════════════
    await page.click('[data-composition="couple"]');
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '04_gallery_couple_selected');

    // Capture Couple Artwork close crop
    const couplePlateEl = await page.$('[data-artwork-plate="true"]');
    if (couplePlateEl) {
      const box = await couplePlateEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_couple_gallery.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_couple_gallery.png'), path.join(ARTIFACT_QA_DIR, 'crop_couple_gallery.png'));
    }

    // Open Couple Popup
    await page.click('[data-explore-btn="true"]');
    await new Promise(r => setTimeout(r, 600));
    await capture(page, '05_couple_fullscreen_popup');

    const couplePopupImgEl = await page.$('[role="dialog"] img');
    if (couplePopupImgEl) {
      const box = await couplePopupImgEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_couple_popup.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_couple_popup.png'), path.join(ARTIFACT_QA_DIR, 'crop_couple_popup.png'));
    }

    // Close Popup
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // ═══════════════════════════════════════════════════════════
    // TEST 3: SWITCH TO FAMILY COMPOSITION
    // ═══════════════════════════════════════════════════════════
    await page.click('[data-composition="family"]');
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '06_gallery_family_selected');

    const familyPlateEl = await page.$('[data-artwork-plate="true"]');
    if (familyPlateEl) {
      const box = await familyPlateEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_family_gallery.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_family_gallery.png'), path.join(ARTIFACT_QA_DIR, 'crop_family_gallery.png'));
    }

    // Open Family Popup
    await page.click('[data-explore-btn="true"]');
    await new Promise(r => setTimeout(r, 600));
    await capture(page, '07_family_fullscreen_popup');

    const familyPopupImgEl = await page.$('[role="dialog"] img');
    if (familyPopupImgEl) {
      const box = await familyPopupImgEl.boundingBox();
      await page.screenshot({
        path: path.join(OUT_DIR, 'crop_family_popup.png'),
        clip: box
      });
      fs.copyFileSync(path.join(OUT_DIR, 'crop_family_popup.png'), path.join(ARTIFACT_QA_DIR, 'crop_family_popup.png'));
    }

    // Close Popup
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // ═══════════════════════════════════════════════════════════
    // TEST 4: PRODUCT COLLECTION WITH HORIZONTAL OPTICAL THREAD
    // ═══════════════════════════════════════════════════════════
    await page.evaluate(() => {
      const sec = document.querySelector('[data-section="collection"]');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '08_product_collection_with_optical_thread');

    const collectionThreadProps = await page.evaluate(() => {
      const thread = document.querySelector('[data-optical-thread="collection"]');
      if (!thread) return null;
      const rect = thread.getBoundingClientRect();
      const style = window.getComputedStyle(thread);
      return {
        visible: !!thread,
        rect: { width: rect.width, height: rect.height, top: rect.top },
        pointerEvents: style.pointerEvents,
        opacity: style.opacity
      };
    });
    report.opticalThread.collection = collectionThreadProps;

    // ═══════════════════════════════════════════════════════════
    // TEST 5: DESKTOP 1920x1080 VERIFICATION
    // ═══════════════════════════════════════════════════════════
    await page.setViewport({ width: 1920, height: 1080 });
    await page.evaluate(() => {
      const art = document.getElementById('art');
      if (art) art.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '09_desktop_1920_gallery_optical_thread');

    // ═══════════════════════════════════════════════════════════
    // TEST 6: MOBILE 390x844 VERIFICATION (0 Horizontal Overflow)
    // ═══════════════════════════════════════════════════════════
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Check horizontal overflow
    const mobileOverflow = await page.evaluate(() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
        hasOverflow: document.body.scrollWidth > window.innerWidth
      };
    });
    report.mobileAudit.overflow = mobileOverflow;

    // Scroll to #art on mobile
    await page.evaluate(() => {
      const art = document.getElementById('art');
      if (art) art.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '10_mobile_390_gallery_optical_thread');

    // Switch to Couple on mobile
    await page.click('[data-composition="couple"]');
    await new Promise(r => setTimeout(r, 800));
    await capture(page, '11_mobile_390_couple');

    // Open Popup on mobile
    await page.click('[data-explore-btn="true"]');
    await new Promise(r => setTimeout(r, 600));
    await capture(page, '12_mobile_390_popup');

    await page.close();
  } catch (err) {
    console.error('QA Error:', err);
    report.error = err.message;
  } finally {
    await browser.close();
  }

  // Write audit results
  const reportPath = path.join(OUT_DIR, 'artwork_qa_summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.copyFileSync(reportPath, path.join(ARTIFACT_QA_DIR, 'artwork_qa_summary.json'));
  console.log('--- QA Complete! Report saved to:', reportPath);
}

runQA().catch(console.error);
