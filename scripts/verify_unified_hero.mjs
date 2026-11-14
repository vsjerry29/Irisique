import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_SHOTS = 'D:\\Irisique\\screenshots\\unified';
const ARTIFACTS_SHOTS = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const LOCAL_FRAMES = 'D:\\Irisique\\recordings\\unified\\frames';
const LOCAL_RECORDINGS = 'D:\\Irisique\\recordings\\unified';
const ARTIFACTS_RECORDINGS = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

fs.mkdirSync(LOCAL_SHOTS, { recursive: true });
fs.mkdirSync(ARTIFACTS_SHOTS, { recursive: true });
fs.mkdirSync(LOCAL_FRAMES, { recursive: true });
fs.mkdirSync(LOCAL_RECORDINGS, { recursive: true });
fs.mkdirSync(ARTIFACTS_RECORDINGS, { recursive: true });

async function run() {
  console.log('--- Starting Unified Iris Hero Visual Verification ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Fresh Page Load & Phase 1 Entrance
  console.log('1. Loading homepage at http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  
  // Wait for initial macro pullback entrance timeline to settle (3.8s total duration)
  console.log('Waiting for Phase 1 entrance animation to complete...');
  await new Promise(r => setTimeout(r, 4000));

  // Check hero text visibility
  const heroVisibility = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const explore = document.getElementById('explore');
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().find(s => s.trigger === explore) : null;
    return {
      headingText: heading ? heading.innerText : null,
      headingOpacity: heading ? window.getComputedStyle(heading).opacity : null,
      scrollTriggerTotal: st ? st.end - st.start : null,
    };
  });
  console.log('Hero state:', heroVisibility);

  const saveShot = async (name) => {
    const p1 = path.join(LOCAL_SHOTS, name);
    const p2 = path.join(ARTIFACTS_SHOTS, name);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log(`Saved screenshot: ${name}`);
  };

  await saveShot('01_phase1_macro_settled.png');

  // Find the pinned scroll range of #explore
  const pinRange = await page.evaluate(() => {
    const explore = document.getElementById('explore');
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().find(s => s.trigger === explore) : null;
    return {
      start: st ? st.start : 0,
      end: st ? st.end : 2600,
      total: st ? st.end - st.start : 2600
    };
  });
  console.log('Unified Iris Pin Range:', pinRange);

  // 2. Phase 2: Scroll Activation (p = 0.08)
  const yPhase2 = Math.round(pinRange.start + pinRange.total * 0.08);
  await page.evaluate((y) => window.scrollTo(0, y), yPhase2);
  await new Promise(r => setTimeout(r, 700));
  await saveShot('02_phase2_scroll_activation.png');

  // 3. Phase 3: Organic Unfolding (p = 0.28)
  const yPhase3 = Math.round(pinRange.start + pinRange.total * 0.28);
  await page.evaluate((y) => window.scrollTo(0, y), yPhase3);
  await new Promise(r => setTimeout(r, 700));
  await saveShot('03_phase3_organic_unfolding.png');

  // 4. Phase 4: 3D Immersion (p = 0.55)
  const yPhase4 = Math.round(pinRange.start + pinRange.total * 0.55);
  await page.evaluate((y) => window.scrollTo(0, y), yPhase4);
  await new Promise(r => setTimeout(r, 700));
  await saveShot('04_phase4_3d_immersion.png');

  // 5. Phase 5: Optical Transformation (p = 0.82)
  const yPhase5 = Math.round(pinRange.start + pinRange.total * 0.82);
  await page.evaluate((y) => window.scrollTo(0, y), yPhase5);
  await new Promise(r => setTimeout(r, 700));
  await saveShot('05_phase5_optical_transformation.png');

  // 6. Phase 6: Gallery Exhibition Handoff (p = 1.02 -> Gallery Entry)
  const yPhase6 = Math.round(pinRange.end + 500);
  await page.evaluate((y) => window.scrollTo(0, y), yPhase6);
  await new Promise(r => setTimeout(r, 700));
  await saveShot('06_phase6_gallery_handoff.png');

  // 7. Reverse Scroll back to y = 0
  console.log('Testing upward reverse scroll to y = 0 ...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await saveShot('07_reverse_scroll_restored.png');

  const restoredHero = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const heroOverlay = document.querySelector('#explore > div');
    return {
      headingOpacity: heading ? window.getComputedStyle(heading).opacity : null,
      overlayOpacity: heroOverlay ? window.getComputedStyle(heroOverlay).opacity : null,
    };
  });
  console.log('Restored Hero state at y = 0:', restoredHero);

  // 8. Replay Intro Feature Test
  console.log('Testing __irisReplayIntro() ...');
  await page.evaluate(() => {
    if (window.__irisReplayIntro) window.__irisReplayIntro();
  });
  await new Promise(r => setTimeout(r, 250)); // Capture during macro zoom
  await saveShot('08_replay_intro_macro.png');

  // Wait for replay to settle
  await new Promise(r => setTimeout(r, 3800));

  // 9. Frame recording across complete continuous journey
  console.log('Capturing continuous animation frames for GIF...');
  const totalFrames = 36;
  const journeyMax = pinRange.end + 250;
  for (let i = 0; i <= totalFrames; i++) {
    const currentY = Math.round((i / totalFrames) * journeyMax);
    await page.evaluate((y) => window.scrollTo(0, y), currentY);
    await new Promise(r => setTimeout(r, 120));
    const fp = path.join(LOCAL_FRAMES, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
  }

  console.log(`Captured ${totalFrames + 1} frames.`);
  await browser.close();
  console.log('Browser closed. Verification complete.');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
