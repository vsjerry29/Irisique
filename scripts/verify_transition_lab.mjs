import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\transition_lab_qa';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting Transition Lab Puppeteer Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('🌐 Navigating to http://localhost:3000/transition-lab...');
  await page.goto('http://localhost:3000/transition-lab', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for WebGL canvas and scene to settle
  await new Promise((r) => setTimeout(r, 2000));

  // Verify elements are present
  const heroPresent = await page.$('[data-section="transition-lab-stage"]');
  console.log(`✓ Transition Lab Stage Container Present: ${!!heroPresent}`);

  // Test still frames at p = 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
  const progressSteps = [
    { label: 'p0_hero', p: 0.0 },
    { label: 'p20_seam_entry', p: 0.2 },
    { label: 'p40_mid_seam', p: 0.4 },
    { label: 'p60_iris_align', p: 0.6 },
    { label: 'p80_stroma_handoff', p: 0.8 },
    { label: 'p100_gallery_settled', p: 1.0 },
  ];

  const results = {
    steps: [],
    pupilColorChecks: [],
    layoutMetrics: {},
  };

  // Get ScrollTrigger metrics for stage
  const stMetrics = await page.evaluate(() => {
    const st = window.ScrollTrigger?.getAll()[0];
    return {
      start: st?.start || 0,
      end: st?.end || (window.innerHeight * 0.75),
      totalTravel: (st?.end || 675) - (st?.start || 0),
    };
  });
  console.log('ScrollTrigger travel metrics:', stMetrics);

  for (const step of progressSteps) {
    const scrollTarget = stMetrics.start + step.p * stMetrics.totalTravel;
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    await new Promise((r) => setTimeout(r, 600));

    // Capture screenshot
    const shotPath = path.join(ARTIFACT_DIR, `01_lab_${step.label}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`📸 Captured screenshot: ${step.label} at scroll=${scrollTarget}px`);

    // Sample pupil color at canvas center to confirm pupil is pitch-black (NEVER WHITE!)
    const pixelAnalysis = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas found' };
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'No GL context' };

      // Sample a 5x5 area at the center of the canvas
      const width = canvas.width;
      const height = canvas.height;
      const centerX = Math.floor(width / 2);
      const centerY = Math.floor(height / 2);

      const pixels = new Uint8Array(5 * 5 * 4);
      gl.readPixels(centerX - 2, centerY - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      let totalR = 0, totalG = 0, totalB = 0;
      for (let i = 0; i < 25; i++) {
        totalR += pixels[i * 4];
        totalG += pixels[i * 4 + 1];
        totalB += pixels[i * 4 + 2];
      }
      const avgR = totalR / 25;
      const avgG = totalG / 25;
      const avgB = totalB / 25;
      const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

      return { avgR, avgG, avgB, luminance };
    });

    results.pupilColorChecks.push({
      step: step.label,
      p: step.p,
      pixelAnalysis,
      isPupilDark: pixelAnalysis.luminance < 0.25, // Pupil must be dark, not white!
    });
  }

  // Check Gallery Layout metrics at p = 1.0
  console.log('📏 Measuring Gallery and Product Collection layout metrics...');
  const layoutCheck = await page.evaluate(() => {
    const galleryHeadline = document.querySelector('h2');
    const artworkPlate = document.querySelector('[data-artwork-plate="true"]');
    const productSection = document.querySelector('#collection');
    const gallerySection = document.querySelector('[data-section="transition-lab-stage"]');

    const gRect = gallerySection?.getBoundingClientRect();
    const hRect = galleryHeadline?.getBoundingClientRect();
    const pRect = productSection?.getBoundingClientRect();

    return {
      galleryTotalHeight: gallerySection?.scrollHeight || 0,
      isHeadlineVisible: !!galleryHeadline && hRect.top >= 0 && hRect.bottom > hRect.top,
      headlineText: galleryHeadline?.innerText.replace(/\n/g, ' ') || '',
      productSectionTop: pRect?.top || 0,
    };
  });
  results.layoutMetrics = layoutCheck;
  console.log('Layout metrics at p=1.0:', layoutCheck);

  // Scroll downwards to Product Collection to verify boundary
  console.log('📜 Scrolling into Product Collection...');
  await page.evaluate(() => {
    const prod = document.querySelector('#collection');
    prod?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 600));

  const prodShotPath = path.join(ARTIFACT_DIR, '02_lab_products_boundary.png');
  await page.screenshot({ path: prodShotPath });
  console.log(`📸 Captured Products boundary screenshot: ${prodShotPath}`);

  // Test reverse scrolling back to Hero (3 cycles)
  console.log('🔄 Testing reverse scroll resilience (3 cycles)...');
  for (let cycle = 1; cycle <= 3; cycle++) {
    // Scroll to 0
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));
    // Scroll to 100%
    await page.evaluate((stMetrics) => window.scrollTo(0, stMetrics.end), stMetrics);
    await new Promise((r) => setTimeout(r, 300));
  }
  // Settle at scroll 0
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));
  const revShotPath = path.join(ARTIFACT_DIR, '03_lab_reverse_scroll_settled.png');
  await page.screenshot({ path: revShotPath });

  // Test Mobile Viewport (iPhone 14 Pro: 390x844)
  console.log('📱 Testing Mobile Viewport (390px)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));

  const mobileHeroShot = path.join(ARTIFACT_DIR, '04_lab_mobile_hero.png');
  await page.screenshot({ path: mobileHeroShot });

  // Scroll to Gallery on mobile
  await page.evaluate(() => {
    const st = window.ScrollTrigger?.getAll()[0];
    if (st) window.scrollTo(0, st.end);
  });
  await new Promise((r) => setTimeout(r, 600));
  const mobileGalleryShot = path.join(ARTIFACT_DIR, '05_lab_mobile_gallery.png');
  await page.screenshot({ path: mobileGalleryShot });

  // Save full JSON report
  const reportPath = path.join(ARTIFACT_DIR, 'transition_lab_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Transition Lab Report written to ${reportPath}`);

  await browser.close();
  console.log('🎉 Verification completed successfully.');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
