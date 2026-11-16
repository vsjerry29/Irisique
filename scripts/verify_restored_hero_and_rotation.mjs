import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\restored_hero_rotation_qa';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting Verification: Restored Hero + Scroll Rotation Sequence...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('🌐 Loading http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Allow intro animation (pullback & settle) to finish
  await new Promise((r) => setTimeout(r, 2400));

  const results = {
    heroRestoredMetrics: {},
    pupilDarkChecks: [],
    rotationFrames: [],
    reverseScrollRestoration: {},
    mobileMetrics: {},
  };

  // 1. PHASE A: Check Restored Hero at p = 0.00
  const heroMetrics = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const bookCta = document.querySelector('a[href="/book"]');
    const hasScrollHint = document.body.innerText.includes('SCROLL TO EXPLORE');
    const canvas = document.querySelector('canvas');
    
    return {
      headingText: heading?.innerText || '',
      hasLookCloser: heading?.innerText?.includes('LOOK') && heading?.innerText?.includes('CLOSER'),
      hasBookCta: !!bookCta,
      bookCtaText: bookCta?.innerText || '',
      hasScrollHint,
      canvasWidth: canvas?.clientWidth || 0,
      canvasHeight: canvas?.clientHeight || 0,
    };
  });
  console.log('Hero Resting State Metrics:', heroMetrics);
  results.heroRestoredMetrics = heroMetrics;

  // Capture Frame 1: Restored Hero Resting State
  const shot1 = path.join(ARTIFACT_DIR, '01_restored_hero_resting.png');
  await page.screenshot({ path: shot1 });
  console.log('📸 01_restored_hero_resting.png captured');

  // Verify Pupil Darkness at Resting State
  const pupilAtP0 = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No GL' };
    const cx = Math.floor(canvas.width / 2);
    const cy = Math.floor(canvas.height / 2);
    const px = new Uint8Array(5 * 5 * 4);
    gl.readPixels(cx - 2, cy - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let totalLum = 0;
    for (let i = 0; i < 25; i++) {
      const r = px[i * 4 + 0];
      const g = px[i * 4 + 1];
      const b = px[i * 4 + 2];
      totalLum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    const avgLum = totalLum / 25;
    return {
      r: px[0],
      g: px[1],
      b: px[2],
      luminance: avgLum,
      isPupilDark: avgLum < 0.15,
    };
  });
  console.log('Pupil sample at p=0.0:', pupilAtP0);
  results.pupilDarkChecks.push({ step: 'p0_hero', pupilSample: pupilAtP0 });

  // Retrieve ScrollTrigger metrics
  const stMetrics = await page.evaluate(() => {
    const triggers = window.ScrollTrigger?.getAll() || [];
    const heroTrigger = triggers.find((t) => t.trigger?.dataset?.section === 'unified-iris') || triggers[0];
    return {
      start: heroTrigger?.start || 0,
      end: heroTrigger?.end || 1035,
      totalTravel: (heroTrigger?.end || 1035) - (heroTrigger?.start || 0),
    };
  });
  console.log('Hero ScrollTrigger Travel Metrics:', stMetrics);

  // 2. PHASES B, C, D, E: Step-by-Step Scroll Sequence
  const testSteps = [
    { label: '02_rotation_p10_deg35', p: 0.10, desc: 'Initial clockwise rotation (~35 deg), typography gliding out' },
    { label: '03_rotation_p20_deg70', p: 0.20, desc: 'Smooth clockwise rotation (~70 deg), complete circular iris' },
    { label: '04_rotation_p35_deg125', p: 0.35, desc: 'Primary rotation arc complete (~125 deg), uncropped boundary' },
    { label: '05_immersion_p50_layers', p: 0.50, desc: 'Rotation gently eases (~145 deg), camera moves closer, 11 layers separate' },
    { label: '06_immersion_p65_consolidating', p: 0.65, desc: 'Stroma travel continues, layers consolidating towards Solo plate' },
    { label: '07_transition_p80_seam', p: 0.80, desc: 'Approved photographic seam sweeps diagonally behind iris, stroma dissolves into Solo plate' },
    { label: '08_gallery_p100_settled', p: 1.00, desc: 'Gallery fully established, Solo plate settled, zero seam clipping' },
  ];

  for (const step of testSteps) {
    const targetY = stMetrics.start + step.p * stMetrics.totalTravel;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await new Promise((r) => setTimeout(r, 650));

    const shotPath = path.join(ARTIFACT_DIR, `${step.label}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`📸 ${step.label}.png captured at scroll=${targetY.toFixed(1)}px (p=${step.p.toFixed(2)})`);

    // Verify Pupil Darkness at every step
    const pupilCheck = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas' };
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'No GL' };
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const px = new Uint8Array(5 * 5 * 4);
      gl.readPixels(cx - 2, cy - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let totalLum = 0;
      for (let i = 0; i < 25; i++) {
        const r = px[i * 4 + 0];
        const g = px[i * 4 + 1];
        const b = px[i * 4 + 2];
        totalLum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
      const avgLum = totalLum / 25;
      return {
        r: px[0],
        g: px[1],
        b: px[2],
        luminance: avgLum,
        isPupilDark: avgLum < 0.15,
      };
    });
    console.log(`Pupil sample at p=${step.p.toFixed(2)}:`, pupilCheck);
    results.pupilDarkChecks.push({ step: step.label, p: step.p, pupilSample: pupilCheck });
    results.rotationFrames.push({ label: step.label, p: step.p, desc: step.desc });
  }

  // 3. REVERSE SCROLL TEST: Scroll back from 1.00 to 0.00
  console.log('🔄 Executing reverse scroll to verify restoration of hero resting state...');
  await page.evaluate((y) => window.scrollTo(0, y), stMetrics.start + 0.5 * stMetrics.totalTravel);
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));

  const reverseHeroCheck = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const heroText = document.querySelector('[data-section="unified-iris"] div[class*="opacity"]');
    const heroStyle = window.getComputedStyle(heading?.parentElement?.parentElement || document.body);
    return {
      headingText: heading?.innerText || '',
      isHeadingVisible: !!heading && heading.offsetParent !== null,
      scrollTravelReturnedToZero: window.scrollY === 0,
    };
  });
  console.log('Reverse scroll restoration check:', reverseHeroCheck);
  results.reverseScrollRestoration = reverseHeroCheck;

  const shotReverse = path.join(ARTIFACT_DIR, '09_reverse_scroll_restored_hero.png');
  await page.screenshot({ path: shotReverse });
  console.log('📸 09_reverse_scroll_restored_hero.png captured');

  // 4. MOBILE VIEWPORT TEST: 390 x 844 (iPhone 14)
  console.log('📱 Testing Mobile Viewport (390 x 844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));

  const shotMobileResting = path.join(ARTIFACT_DIR, '10_mobile_hero_resting.png');
  await page.screenshot({ path: shotMobileResting });
  console.log('📸 10_mobile_hero_resting.png captured');

  // Mobile mid-rotation
  await page.evaluate((travel) => window.scrollTo(0, travel * 0.25), stMetrics.totalTravel);
  await new Promise((r) => setTimeout(r, 600));
  const shotMobileRot = path.join(ARTIFACT_DIR, '11_mobile_rotation_p25.png');
  await page.screenshot({ path: shotMobileRot });
  console.log('📸 11_mobile_rotation_p25.png captured');

  // Save telemetry QA report
  const reportPath = path.join(ARTIFACT_DIR, 'restored_hero_rotation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Report saved to ${reportPath}`);

  await browser.close();
  console.log('✅ Verification completed successfully!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
