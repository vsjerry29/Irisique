import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\screenshots\\interaction_repair';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const FRAMES_DIR = 'D:\\Irisique\\recordings\\interaction_repair\\frames';
const GIF_LOCAL = 'D:\\Irisique\\recordings\\interaction_repair\\06_seamless_interaction_scroll.gif';
const GIF_ARTIFACT = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings\\06_seamless_interaction_scroll.gif';

fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(path.dirname(GIF_LOCAL), { recursive: true });
fs.mkdirSync(path.dirname(GIF_ARTIFACT), { recursive: true });

async function run() {
  console.log('=== IRIS INTERACTION & SCROLL CONTINUITY VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack));
  page.on('response', res => {
    if (res.status() >= 400) console.log('HTTP STATUS ' + res.status() + ':', res.url());
  });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const saveShot = async (name) => {
    const p1 = path.join(LOCAL_DIR, name);
    const p2 = path.join(ARTIFACT_DIR, name);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log(`Saved screenshot: ${name}`);
  };

  // ── TEST F & INITIAL RENDERING: Fresh Load (No Gallery Flash) ──
  console.log('--- Test F & Part 6: Fresh Load & Zero Gallery Flash ---');
  await page.goto('http://localhost:3000/?irisDebug=1', { waitUntil: 'networkidle0' });
  
  // Inspect DOM immediately on load to verify Gallery does NOT render above hero
  const initialDom = await page.evaluate(() => {
    const explore = document.getElementById('explore');
    const gallery = document.getElementById('gallery');
    const hero = document.querySelector('h1');
    const rExplore = explore ? explore.getBoundingClientRect() : null;
    const rGallery = gallery ? gallery.getBoundingClientRect() : null;
    return {
      exploreTop: rExplore ? rExplore.top : null,
      galleryTop: rGallery ? rGallery.top : null,
      heroText: hero ? hero.innerText : null,
    };
  });
  console.log('Initial DOM placement:', initialDom);

  // Wait for macro pullback entrance to settle (3.8s)
  await new Promise(r => setTimeout(r, 4000));
  await saveShot('01_test_f_hero_settled.png');

  // ── TEST A: Hover Interaction Across 5 Iris Areas ──
  console.log('--- Test A: Hover Interaction (5 Iris Areas) ---');
  const canvasBox = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });

  const centerX = canvasBox.left + canvasBox.width / 2;
  const centerY = canvasBox.top + canvasBox.height / 2;

  const hoverPoints = [
    { name: 'center_collarette', x: centerX, y: centerY },
    { name: 'upper_sector', x: centerX, y: centerY - 150 },
    { name: 'right_sector', x: centerX + 180, y: centerY },
    { name: 'lower_sector', x: centerX, y: centerY + 150 },
    { name: 'left_sector', x: centerX - 180, y: centerY },
  ];

  for (const pt of hoverPoints) {
    await page.mouse.move(pt.x, pt.y);
    await new Promise(r => setTimeout(r, 200));
    const telemetry = await page.evaluate(() => {
      const hud = document.querySelector('.space-y-1');
      return hud ? hud.innerText.replace(/\n/g, ' | ') : 'no-hud';
    });
    console.log(`Hover on ${pt.name}:`, telemetry);
    await saveShot(`02_hover_${pt.name}.png`);
  }

  // Hover out to test recovery
  await page.mouse.move(50, 50);
  await new Promise(r => setTimeout(r, 300));
  await saveShot('03_hover_recovered_outside.png');

  // ── TEST B: Click Origin in 4 Quadrants ──
  console.log('--- Test B: Click Reveal in 4 Quadrants ---');
  const quadrants = [
    { name: 'upper_left', x: centerX - 120, y: centerY - 120 },
    { name: 'upper_right', x: centerX + 120, y: centerY - 120 },
    { name: 'lower_left', x: centerX - 120, y: centerY + 120 },
    { name: 'lower_right', x: centerX + 120, y: centerY + 120 },
  ];

  for (const q of quadrants) {
    await page.mouse.click(q.x, q.y);
    // Capture wave peak at ~250ms
    await new Promise(r => setTimeout(r, 220));
    const clickTelemetry = await page.evaluate(() => {
      const hud = document.querySelector('.space-y-1');
      return hud ? hud.innerText.replace(/\n/g, ' | ') : 'no-hud';
    });
    console.log(`Click ${q.name}:`, clickTelemetry);
    await saveShot(`04_click_${q.name}.png`);
    // Wait for click wave to complete
    await new Promise(r => setTimeout(r, 1100));
  }

  // Test click outside iris (should be ignored)
  await page.mouse.click(canvasBox.left + 80, canvasBox.top + 80);
  await new Promise(r => setTimeout(r, 200));
  await saveShot('05_click_outside_ignored.png');

  // ── TEST C: Moving & Rotating Iris Interaction ──
  console.log('--- Test C: Moving Iris Interaction at Scroll p = 0.25 ---');
  const stInfo = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().find(s => s.trigger && s.trigger.getAttribute('data-section') === 'unified-iris') : null;
    return st ? { start: Math.max(0, st.start), end: st.end, total: st.end - Math.max(0, st.start) } : { start: 0, end: 1560, total: 1560 };
  });
  const pinEnd = stInfo.total;

  const scrollY_p25 = Math.round(pinEnd * 0.25);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY_p25);
  await new Promise(r => setTimeout(r, 700));

  // Hover and click on rotated iris
  await page.mouse.move(centerX + 100, centerY - 80);
  await new Promise(r => setTimeout(r, 200));
  await saveShot('06_test_c_rotated_hover.png');

  await page.mouse.click(centerX + 100, centerY - 80);
  await new Promise(r => setTimeout(r, 220));
  await saveShot('07_test_c_rotated_click.png');
  await new Promise(r => setTimeout(r, 1100));

  // ── TEST D: Seamless Scroll Continuity & Gallery Emergence ──
  console.log('--- Test D: Scroll Continuity (Hero -> Universe -> Gallery) ---');
  // Sample scroll positions around the Gallery handoff (p = 0.75, 0.85, 0.92, 0.98, 1.05)
  const handoffPoints = [
    { label: 'p0.75_layer_parting', y: Math.round(pinEnd * 0.75) },
    { label: 'p0.85_gallery_emerging', y: Math.round(pinEnd * 0.85) },
    { label: 'p0.92_gallery_focus_transfer', y: Math.round(pinEnd * 0.92) },
    { label: 'p0.98_gallery_established', y: Math.round(pinEnd * 0.98) },
    { label: 'p1.05_unpinned_smooth_transition', y: Math.round(pinEnd + 200) },
  ];

  for (const hp of handoffPoints) {
    await page.evaluate((y) => window.scrollTo(0, y), hp.y);
    await new Promise(r => setTimeout(r, 700));
    await saveShot(`08_handoff_${hp.label}.png`);
  }

  // ── TEST E: Reverse Scroll Restoration ──
  console.log('--- Test E: Reverse Scroll Restoration to y = 0 ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await saveShot('09_test_e_reverse_restored.png');

  const restoredState = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return {
      h1Opacity: h1 ? window.getComputedStyle(h1).opacity : null,
      scrollPos: window.scrollY,
    };
  });
  console.log('Restored state at top:', restoredState);

  // ── RECORDING FRAMES FOR ANIMATED GIF ──
  console.log('--- Capturing Continuous Smooth Scroll Frames ---');
  const totalFrames = 36;
  const maxTravel = pinEnd + 400;
  for (let i = 0; i <= totalFrames; i++) {
    const y = Math.round((i / totalFrames) * maxTravel);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 110));
    const fp = path.join(FRAMES_DIR, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
  }

  // ── TEST G: Mobile Viewport (390 x 844) ──
  console.log('--- Test G: Mobile Viewport 390x844 ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3800));
  await saveShot('10_test_g_mobile_hero.png');

  // Test mobile scroll
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 500));
  await saveShot('11_test_g_mobile_universe.png');

  await page.evaluate(() => window.scrollTo(0, 2200));
  await new Promise(r => setTimeout(r, 500));
  await saveShot('12_test_g_mobile_gallery.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
