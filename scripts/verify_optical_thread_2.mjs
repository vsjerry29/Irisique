import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const OUT_DIR = 'D:/Irisique/screenshots/thread_v2_qa';
const FRAMES_DIR = 'D:/Irisique/recordings/thread_v2_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70';
const ARTIFACT_QA_DIR = path.join(ARTIFACT_DIR, 'screenshots/thread_v2_qa');
const ARTIFACT_REC_DIR = path.join(ARTIFACT_DIR, 'recordings');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_QA_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_REC_DIR, { recursive: true });

async function runOpticalThreadV2QA() {
  console.log('--- Starting Optical Thread 2.0 Comprehensive QA ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    checkpoints: {},
    diagnostics: {},
    mobileAudit: {},
    interactions: {},
  };

  let frameIdx = 0;
  async function snap(page, name) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, '0');
    const localFile = path.join(OUT_DIR, `${name}.png`);
    const frameFile = path.join(FRAMES_DIR, `frame_${num}_${name}.png`);
    const artFile = path.join(ARTIFACT_QA_DIR, `${name}.png`);

    await page.screenshot({ path: localFile });
    fs.copyFileSync(localFile, frameFile);
    fs.copyFileSync(localFile, artFile);
    console.log(`Saved screenshot: ${name}.png`);
    return localFile;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Load with debug mode enabled first to test telemetry & anchor metrics
    await page.goto(`${BASE_URL}?threadDebug=1`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // ═══════════════════════════════════════════════════════════
    // PASS 1: CAPTURE THE 10 MANDATORY CHECKPOINTS IN SEQUENCE
    // ═══════════════════════════════════════════════════════════

    // Checkpoint 1: Hero-to-Gallery Entrance
    const artPos = await page.evaluate(() => {
      const el = document.getElementById('art');
      return el ? el.getBoundingClientRect().top + window.scrollY : 2700;
    });

    await page.evaluate((top) => window.scrollTo({ top: top - 80, behavior: 'instant' }), artPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '01_hero_to_gallery_entrance');

    // Checkpoint 2: Gallery Upper Area
    await page.evaluate((top) => window.scrollTo({ top: top + 250, behavior: 'instant' }), artPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '02_gallery_upper_area');

    // Checkpoint 3: Gallery Lower Area (Artwork Specimen & docked controls)
    await page.evaluate((top) => window.scrollTo({ top: top + 750, behavior: 'instant' }), artPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '03_gallery_lower_area');

    // Checkpoint 4: Gallery-to-Products Boundary (Large sweeping bridge curve)
    const colPos = await page.evaluate(() => {
      const el = document.querySelector('[data-section="collection"]');
      return el ? el.getBoundingClientRect().top + window.scrollY : 4160;
    });
    await page.evaluate((top) => window.scrollTo({ top: top - 150, behavior: 'instant' }), colPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '04_gallery_to_products_boundary');

    // Checkpoint 5: Product Collection Midpoint (Horizontal travel guide)
    await page.evaluate((top) => window.scrollTo({ top: top + 450, behavior: 'instant' }), colPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '05_product_collection_midpoint');

    // Checkpoint 6: Products-to-Experience Boundary
    const expPos = await page.evaluate(() => {
      const el = document.getElementById('experience');
      return el ? el.getBoundingClientRect().top + window.scrollY : 5570;
    });
    await page.evaluate((top) => window.scrollTo({ top: top - 120, behavior: 'instant' }), expPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '06_products_to_experience_boundary');

    // Checkpoint 7: Capture / Create / Keep (Grand S-Curve & Elliptical sweep)
    await page.evaluate((top) => window.scrollTo({ top: top + 600, behavior: 'instant' }), expPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '07_experience_grand_s_curve');

    // Checkpoint 8: Experience-to-Booking Boundary
    const bookPos = await page.evaluate(() => {
      const el = document.getElementById('booking');
      return el ? el.getBoundingClientRect().top + window.scrollY : 8090;
    });
    await page.evaluate((top) => window.scrollTo({ top: top - 100, behavior: 'instant' }), bookPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '08_experience_to_booking_boundary');

    // Checkpoint 9: Booking Invitation (Adapting to dark #090909 surface)
    await page.evaluate((top) => window.scrollTo({ top: top + 350, behavior: 'instant' }), bookPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '09_booking_invitation_dark_surface');

    // Checkpoint 10: Footer (Passing near IRIS wordmark to deliberate endpoint)
    const footPos = await page.evaluate(() => {
      const el = document.getElementById('footer');
      return el ? el.getBoundingClientRect().top + window.scrollY : 9110;
    });
    await page.evaluate((top) => window.scrollTo({ top: top + 150, behavior: 'instant' }), footPos);
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '10_footer_wordmark_and_terminus');

    // ═══════════════════════════════════════════════════════════
    // PASS 2: TELEMETRY & DIAGNOSTIC AUDIT
    // ═══════════════════════════════════════════════════════════
    const telemetry = await page.evaluate(() => {
      const hud = document.querySelector('[data-thread-debug="true"]');
      const traceSvg = document.querySelector('#optical-trace-layer svg');
      const activePath = traceSvg ? traceSvg.querySelector('path:nth-of-type(2)') : null;
      const bead = traceSvg ? traceSvg.querySelector('circle:nth-last-of-type(1)') : null;

      return {
        hudPresent: !!hud,
        svgDimensions: traceSvg ? { w: traceSvg.clientWidth, h: traceSvg.clientHeight } : null,
        pathLength: activePath && activePath.getTotalLength ? activePath.getTotalLength() : null,
        beadPosition: bead ? { cx: bead.getAttribute('cx'), cy: bead.getAttribute('cy'), fill: bead.getAttribute('fill') } : null,
      };
    });
    auditReport.diagnostics = telemetry;

    // ═══════════════════════════════════════════════════════════
    // PASS 3: INTERACTION TESTS (Modals, Selection, Carousel)
    // ═══════════════════════════════════════════════════════════
    // Scroll back to gallery
    await page.evaluate((top) => window.scrollTo({ top: top + 500, behavior: 'instant' }), artPos);
    await new Promise(r => setTimeout(r, 600));

    // Switch to Couple
    await page.click('[data-composition="couple"]');
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '11_interaction_couple_switch');

    // Open Artwork Popup
    await page.click('[data-explore-btn="true"]');
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '12_interaction_popup_modal');

    // Close Popup with ESC
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // ═══════════════════════════════════════════════════════════
    // PASS 4: DESKTOP 1920x1080 VERIFICATION
    // ═══════════════════════════════════════════════════════════
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      const col = document.querySelector('[data-section="collection"]');
      if (col) col.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));
    await snap(page, '13_desktop_1920_collection_optical_thread');

    // ═══════════════════════════════════════════════════════════
    // PASS 5: MOBILE 390x844 VERIFICATION (Zero Overflow)
    // ═══════════════════════════════════════════════════════════
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const mobileMetrics = await page.evaluate(() => {
      const traceSvg = document.querySelector('#optical-trace-layer svg');
      return {
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
        hasOverflow: document.body.scrollWidth > window.innerWidth,
        svgMounted: !!traceSvg,
      };
    });
    auditReport.mobileAudit = mobileMetrics;

    // Scroll to Gallery on Mobile
    await page.evaluate(() => {
      const art = document.getElementById('art');
      if (art) art.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '14_mobile_390_gallery_thread');

    // Scroll to Products on Mobile
    await page.evaluate(() => {
      const col = document.querySelector('[data-section="collection"]');
      if (col) col.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '15_mobile_390_products_thread');

    // Scroll to Experience on Mobile
    await page.evaluate(() => {
      const exp = document.getElementById('experience');
      if (exp) exp.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '16_mobile_390_experience_thread');

    // Scroll to Booking on Mobile
    await page.evaluate(() => {
      const book = document.getElementById('booking');
      if (book) book.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '17_mobile_390_booking_thread');

    // Scroll to Footer on Mobile
    await page.evaluate(() => {
      const foot = document.getElementById('footer');
      if (foot) foot.scrollIntoView({ behavior: 'instant', block: 'end' });
    });
    await new Promise(r => setTimeout(r, 600));
    await snap(page, '18_mobile_390_footer_terminus');

    // ═══════════════════════════════════════════════════════════
    // PASS 6: CONTINUOUS SLOW-SCROLL WALKTHROUGH CAPTURE (FOR MASTER GIF)
    // ═══════════════════════════════════════════════════════════
    console.log('Capturing continuous scroll frames for master GIF...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const totalDocHeight = await page.evaluate(() => document.body.scrollHeight);
    const postHeroStart = await page.evaluate(() => {
      const el = document.getElementById('post-hero-system');
      return el ? el.getBoundingClientRect().top + window.scrollY : 2700;
    });

    const scrollSteps = 32;
    const stepSize = (totalDocHeight - postHeroStart - 800) / scrollSteps;

    // Forward slow scroll from Hero exit to Footer
    for (let i = 0; i <= scrollSteps; i++) {
      const targetY = postHeroStart + i * stepSize;
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
      await new Promise(r => setTimeout(r, 70));
      frameIdx++;
      const num = String(frameIdx).padStart(3, '0');
      await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${num}_scroll_fwd.png`) });
    }

    // Brief reverse scroll check
    for (let i = 4; i >= 0; i--) {
      const targetY = totalDocHeight - 800 - i * stepSize * 2;
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
      await new Promise(r => setTimeout(r, 70));
      frameIdx++;
      const num = String(frameIdx).padStart(3, '0');
      await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${num}_scroll_rev.png`) });
    }

    await page.close();
  } catch (err) {
    console.error('QA Error:', err);
    auditReport.error = err.message;
  } finally {
    await browser.close();
  }

  // Save report JSON
  const reportPath = path.join(OUT_DIR, 'thread_v2_qa_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  fs.copyFileSync(reportPath, path.join(ARTIFACT_QA_DIR, 'thread_v2_qa_report.json'));
  console.log('Report saved to:', reportPath);

  // Compile master walkthrough animated GIF
  console.log('Compiling master animated GIF...');
  const pyCode = `
from PIL import Image
import glob
import os

frames = sorted(glob.glob('${FRAMES_DIR.replace(/\\/g, '/')}/frame_*_scroll_*.png'))
if not frames:
    frames = sorted(glob.glob('${FRAMES_DIR.replace(/\\/g, '/')}/frame_*.png'))

images = []
for f in frames[::1]: # take all frames
    im = Image.open(f).convert('RGB')
    im = im.resize((960, 600), Image.Resampling.LANCZOS)
    im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
    images.append(im)

out_local = 'D:/Irisique/recordings/optical_thread_v2_full_walkthrough.gif'
out_art = '${ARTIFACT_DIR.replace(/\\/g, '/')}/recordings/optical_thread_v2_full_walkthrough.gif'

if images:
    images[0].save(out_local, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    images[0].save(out_art, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    sz = os.path.getsize(out_local) / 1024
    print(f'Master GIF generated successfully: {sz:.1f} KB')
`;

  fs.writeFileSync('D:/Irisique/scripts/make_master_thread_v2_gif.py', pyCode);
  execSync('python D:/Irisique/scripts/make_master_thread_v2_gif.py', { stdio: 'inherit' });
}

runOpticalThreadV2QA().catch(console.error);
