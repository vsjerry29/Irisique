import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\exact_hero_scroll_zoom_qa';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Running Exact Hero Composition & Monotonic Forward Pupil Zoom QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ─── TEST 1: Canonical 1758 x 830 Viewport Verification ───
  const page = await browser.newPage();
  await page.setViewport({ width: 1758, height: 830, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  // Wait for intro cinematic to complete (3.8s intro timeline)
  await new Promise(r => setTimeout(r, 4200));

  // Inspect resting metrics via webgl canvas read or analytical calculation
  const restingEval = await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const restingX = Math.max(0.015, Math.min(0.038, (0.515 - 0.5) * aspect));
    const pupilCenterX = (0.5 + restingX / aspect) * w;
    const pupilCenterY = 0.5 * h;
    const irisDiameter = 0.93 * 0.90 * h;

    const h1 = document.querySelector('h1');
    const cta = document.querySelector('a[href="/book"]');

    return {
      w,
      h,
      aspect: aspect.toFixed(3),
      irisDiameterPx: irisDiameter.toFixed(1),
      irisDiameterVh: ((irisDiameter / h) * 100).toFixed(1) + 'vh',
      pupilCenterXPx: pupilCenterX.toFixed(1),
      pupilCenterXPercent: ((pupilCenterX / w) * 100).toFixed(2) + '%',
      pupilCenterYPx: pupilCenterY.toFixed(1),
      pupilCenterYPercent: ((pupilCenterY / h) * 100).toFixed(2) + '%',
      h1Visible: !!h1 && h1.offsetParent !== null,
      ctaVisible: !!cta && cta.offsetParent !== null,
    };
  });
  console.log('1758x830 Resting Metrics:', restingEval);

  // 1. Restored original hero
  await page.screenshot({ path: path.join(OUT_DIR, '01_resting_hero_1758x830.png') });

  // ─── TEST 2: 9 Required Scroll States on 1758x830 ───
  // Total scroll distance is 1.75 * 830 = 1452px
  const totalPinScroll = 1452;

  const SCROLL_STATES = [
    { name: '02_iris_rotating_p12', p: 0.12, label: '2. Iris rotating at original visible scale' },
    { name: '03_iris_rotating_90deg_p22', p: 0.22, label: '3. Iris at approx 90 deg rotation' },
    { name: '04_forward_zoom_start_p32', p: 0.32, label: '4. Beginning of forward zoom' },
    { name: '05_enlarged_fibres_p55', p: 0.55, label: '5. Enlarged microscopic fibres' },
    { name: '06_camera_approaching_pupil_p75', p: 0.75, label: '6. Camera approaching the pupil' },
    { name: '07_pupil_50pct_viewport_p85', p: 0.85, label: '7. Pupil covering approx 50% of viewport' },
    { name: '08_pupil_full_viewport_p94', p: 0.94, label: '8. Pupil covering the full viewport in black' },
    { name: '09_seam_gallery_handoff_p98', p: 0.98, label: '9. Existing transition into the Gallery' },
    { name: '10_gallery_fully_settled_p100', p: 1.00, label: '10. Gallery fully settled' },
  ];

  for (const st of SCROLL_STATES) {
    const scrollY = Math.round(st.p * totalPinScroll);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    // Wait for intro cinematic to complete (3.8s intro timeline)
  await new Promise(r => setTimeout(r, 4200));
    await page.screenshot({ path: path.join(OUT_DIR, `${st.name}.png`) });
    console.log(`Captured state: ${st.label} at scrollY=${scrollY}`);
  }

  // ─── TEST 3: Reverse Scroll Verification ───
  console.log('Testing reverse scroll back to top...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '11_reverse_scroll_restored_hero.png') });

  // ─── TEST 4: Multi-Resolution Resting Hero Captures ───
  const OTHER_RESOLUTIONS = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '390x844_mobile', width: 390, height: 844 },
  ];

  for (const res of OTHER_RESOLUTIONS) {
    const pRes = await browser.newPage();
    await pRes.setViewport({ width: res.width, height: res.height });
    await pRes.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    // Wait for intro cinematic to complete (3.8s intro timeline)
  await new Promise(r => setTimeout(r, 4200));
    await pRes.screenshot({ path: path.join(OUT_DIR, `resting_hero_${res.name}.png`) });
    await pRes.close();
    console.log(`Captured resting hero for ${res.name}`);
  }

  await page.close();
  await browser.close();
  console.log('✅ QA script finished! Screenshots saved to:', OUT_DIR);
}

runVerification().catch(console.error);
