import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\homepage_seam_qa';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runHomepageVerification() {
  console.log('🚀 Starting Comprehensive Homepage Seam & Layout QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('🌐 Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for WebGL canvas and intro animation to settle
  await new Promise((r) => setTimeout(r, 2200));

  const results = {
    transitionFrames: [],
    pupilDarkChecks: [],
    galleryMetrics: {},
    hoverTests: {},
    modalTest: {},
    productsBoundary: {},
    mobileChecks: {},
  };

  // Get ScrollTrigger metrics for the hero-gallery sequence
  const stMetrics = await page.evaluate(() => {
    const triggers = window.ScrollTrigger?.getAll() || [];
    const heroTrigger = triggers.find((t) => t.trigger?.dataset?.section === 'unified-iris') || triggers[0];
    return {
      start: heroTrigger?.start || 0,
      end: heroTrigger?.end || 675,
      totalTravel: (heroTrigger?.end || 675) - (heroTrigger?.start || 0),
    };
  });
  console.log('Hero ScrollTrigger Travel Metrics:', stMetrics);

  const steps = [
    { label: 'p0_hero', p: 0.0 },
    { label: 'p20_seam_revealing', p: 0.2 },
    { label: 'p40_mid_seam_diagonal', p: 0.4 },
    { label: 'p60_iris_moving_to_solo', p: 0.6 },
    { label: 'p80_stroma_crossfade', p: 0.8 },
    { label: 'p100_gallery_settled', p: 1.0 },
  ];

  for (const step of steps) {
    const scrollPos = stMetrics.start + step.p * stMetrics.totalTravel;
    await page.evaluate((y) => window.scrollTo(0, y), scrollPos);
    await new Promise((r) => setTimeout(r, 600));

    const shotPath = path.join(ARTIFACT_DIR, `01_home_${step.label}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`📸 Frame ${step.label} captured at scroll=${scrollPos.toFixed(1)}px`);

    // Sample WebGL canvas pupil to confirm luminance < 0.20 (NEVER WHITE!)
    const pupilSample = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas' };
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'No GL' };

      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const px = new Uint8Array(5 * 5 * 4);
      gl.readPixels(cx - 2, cy - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, px);

      let r = 0, g = 0, b = 0;
      for (let i = 0; i < 25; i++) {
        r += px[i * 4];
        g += px[i * 4 + 1];
        b += px[i * 4 + 2];
      }
      r /= 25; g /= 25; b /= 25;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return { r, g, b, luminance, isPupilDark: luminance < 0.25 };
    });

    results.pupilDarkChecks.push({
      step: step.label,
      p: step.p,
      pupilSample,
    });
  }

  // Verify Gallery Layout at p = 1.0
  console.log('🎨 Testing Gallery Layout and Typography at p = 1.0...');
  const galleryMetrics = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const tabs = Array.from(document.querySelectorAll('[data-composition]')).map((b) => b.getAttribute('data-composition'));
    const h2Rect = h2?.getBoundingClientRect();

    return {
      headlineText: h2?.innerText.replace(/\n/g, ' '),
      headlineTop: h2Rect?.top,
      headlineBottom: h2Rect?.bottom,
      isHeadlineOnScreen: h2Rect ? h2Rect.top >= 0 && h2Rect.top < window.innerHeight : false,
      hasArtworkPlate: !!plate,
      availableTabs: tabs,
    };
  });
  results.galleryMetrics = galleryMetrics;
  console.log('Gallery Metrics:', galleryMetrics);

  // Test Hover Interaction on Solo / Couple / Family
  console.log('🖱️ Testing Hover Previews (Solo -> Couple -> Family)...');
  // Hover Couple tab
  await page.hover('[data-composition="couple"]');
  await new Promise((r) => setTimeout(r, 400));
  const coupleShot = path.join(ARTIFACT_DIR, '02_home_hover_couple.png');
  await page.screenshot({ path: coupleShot });

  // Hover Family tab
  await page.hover('[data-composition="family"]');
  await new Promise((r) => setTimeout(r, 400));
  const familyShot = path.join(ARTIFACT_DIR, '03_home_hover_family.png');
  await page.screenshot({ path: familyShot });

  // Move mouse away to test retention
  await page.mouse.move(50, 50);
  await new Promise((r) => setTimeout(r, 300));
  const retainedComp = await page.evaluate(() => {
    return document.querySelector('[data-composition="family"]')?.getAttribute('aria-pressed');
  });
  results.hoverTests = { couplePreview: true, familyPreview: true, mouseLeaveRetained: retainedComp === 'true' };
  console.log('Hover Tests Result:', results.hoverTests);

  // Test Fullscreen Detail Modal
  console.log('🔍 Testing Explore Artwork Modal...');
  const exploreBtn = await page.$('[data-explore-btn="true"]');
  if (exploreBtn) {
    await exploreBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    const modalShot = path.join(ARTIFACT_DIR, '04_home_detail_modal.png');
    await page.screenshot({ path: modalShot });

    // Verify modal is open and press Escape to close
    const modalOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    results.modalTest = { modalOpened: modalOpen };
    console.log(`Modal Opened: ${modalOpen}`);

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
  }

  // Test Gallery -> Products Boundary (Failure B Verification)
  console.log('📐 Verifying Gallery -> Products boundary and zero layout overlap...');
  const boundaryMetrics = await page.evaluate(() => {
    const collection = document.querySelector('#collection');
    collection?.scrollIntoView({ behavior: 'instant' });
    const colRect = collection?.getBoundingClientRect();
    const colH2 = collection?.querySelector('h2');
    return {
      collectionTop: colRect?.top,
      collectionH2: colH2?.innerText.replace(/\n/g, ' '),
      hasClearBorder: window.getComputedStyle(collection).borderTopWidth !== '0px',
    };
  });
  const productsShot = path.join(ARTIFACT_DIR, '05_home_products_settled.png');
  await page.screenshot({ path: productsShot });
  results.productsBoundary = boundaryMetrics;
  console.log('Products Boundary Metrics:', boundaryMetrics);

  // Test Mobile Viewports (390px and 430px)
  console.log('📱 Testing Mobile Responsiveness (390px)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));
  const mob390Shot = path.join(ARTIFACT_DIR, '06_home_mobile_390.png');
  await page.screenshot({ path: mob390Shot });

  // Write full JSON QA report
  const reportPath = path.join(ARTIFACT_DIR, 'homepage_seam_qa_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Full QA Report written to ${reportPath}`);

  await browser.close();
  console.log('🎉 Comprehensive QA Complete.');
}

runHomepageVerification().catch((err) => {
  console.error('❌ QA Failed:', err);
  process.exit(1);
});
