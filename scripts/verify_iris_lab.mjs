import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\iris-lab';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\iris-lab';

for (const dir of [SCREENSHOT_DIR, RECORDING_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function run() {
  console.log('=== IRIS LAB UPGRADE V2: THOROUGH VERIFICATION & RECORDINGS ===');
  console.log('Launching Headless Chrome with WebGL / Angle D3D11...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--ignore-gpu-blocklist',
      '--hide-scrollbars'
    ]
  });

  try {
    // -------------------------------------------------------------
    // PASS 1: Still Keyframe Moments (Directed 3.8s Sequence)
    // -------------------------------------------------------------
    console.log('\n--- PASS 1: Capturing Still Keyframe Moments ---');
    const pageStill = await browser.newPage();
    await pageStill.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    const keyMoments = [
      { t: 0.40, name: '01_t0.40_macro_discovery.png', desc: '0.40s: Macro discovery in darkness (teal/amber fibrils)' },
      { t: 1.20, name: '02_t1.20_microscopic_exploration.png', desc: '1.20s: Microscopic exploration (branching networks)' },
      { t: 2.20, name: '03_t2.20_the_great_pullback.png', desc: '2.20s: The great pullback (pupil entering composition)' },
      { t: 3.20, name: '04_t3.20_full_iris_settle.png', desc: '3.20s: Full iris settle (luminous highlights)' },
      { t: 3.80, name: '05_t3.80_living_state.png', desc: '3.80s: Living state (settled & enlarged framing)' },
    ];

    for (const km of keyMoments) {
      await pageStill.goto(`http://localhost:3000/iris-lab?t=${km.t}&replay=1`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));
      const outPath = path.join(SCREENSHOT_DIR, km.name);
      await pageStill.screenshot({ path: outPath });
      console.log(`Saved: ${km.desc} -> ${km.name}`);
    }

    // Capture Rest vs Hover to verify physical fiber displacement
    console.log('Capturing Desktop Rest vs Hover for displacement proof...');
    await pageStill.goto('http://localhost:3000/iris-lab?t=3.8&replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    const shotRest = path.join(SCREENSHOT_DIR, '06_desktop_rest_reference.png');
    await pageStill.screenshot({ path: shotRest });

    // Move cursor to amber crypt region (810, 380)
    await pageStill.mouse.move(720, 450);
    await pageStill.mouse.move(810, 380, { steps: 12 });
    await new Promise(r => setTimeout(r, 350));
    const shotHover = path.join(SCREENSHOT_DIR, '07_desktop_hover_displacement.png');
    await pageStill.screenshot({ path: shotHover });
    console.log(`Saved: 06_desktop_rest_reference.png and 07_desktop_hover_displacement.png`);

    // Mobile Viewport
    console.log('Capturing Mobile 390x844 Viewport...');
    const pageMobStill = await browser.newPage();
    await pageMobStill.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await pageMobStill.goto('http://localhost:3000/iris-lab?t=3.8&replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    const shotMobile = path.join(SCREENSHOT_DIR, '08_mobile_390x844_settled.png');
    await pageMobStill.screenshot({ path: shotMobile });
    console.log(`Saved: 08_mobile_390x844_settled.png`);
    await pageMobStill.close();
    await pageStill.close();

    // -------------------------------------------------------------
    // PASS 2: Capture 7 Animated Recordings
    // -------------------------------------------------------------
    console.log('\n--- PASS 2: Capturing 7 Mandatory Animated Recordings ---');
    const recPage = await browser.newPage();
    await recPage.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });

    const captureSequence = async (name, frameCount, frameAction, delayMs = 60) => {
      const framesTemp = path.join(RECORDING_DIR, `temp_${name}`);
      if (!fs.existsSync(framesTemp)) fs.mkdirSync(framesTemp, { recursive: true });

      const framePaths = [];
      for (let i = 0; i < frameCount; i++) {
        if (frameAction) await frameAction(i, frameCount);
        await new Promise(r => setTimeout(r, delayMs));
        const fPath = path.join(framesTemp, `frame_${String(i).padStart(3, '0')}.png`);
        await recPage.screenshot({ path: fPath });
        framePaths.push(fPath);
      }

      const gifOut = path.join(RECORDING_DIR, `${name}.gif`);
      const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${framesTemp.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${gifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=${delayMs}, loop=0, optimize=True)
    print("Saved GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
      fs.writeFileSync(path.join(RECORDING_DIR, 'assemble.py'), pyScript);
      execSync('python assemble.py', { cwd: RECORDING_DIR });

      for (const f of framePaths) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
      if (fs.existsSync(framesTemp)) fs.rmdirSync(framesTemp);
    };

    // 1. Complete Cinematic Opening (0.00s – 3.80s)
    console.log('1/7: Recording Complete Cinematic Opening (36 frames)...');
    await recPage.goto('http://localhost:3000/iris-lab?replay=1', { waitUntil: 'networkidle0' });
    await captureSequence('01_cinematic_opening', 36, async (i, total) => {
      const t = (i / (total - 1)) * 3.80;
      await recPage.evaluate((seekT) => {
        if (window.__irisLabSeek) window.__irisLabSeek(seekT);
      }, t);
    }, 75);

    // 2. Five Seconds of Idle Animation (Visibly alive biological motion)
    console.log('2/7: Recording Five Seconds of Idle Animation (42 frames)...');
    await recPage.evaluate(() => {
      if (window.__irisLabSeek) window.__irisLabSeek(3.80);
    });
    await captureSequence('02_idle_animation_5s', 42, async () => {}, 115);

    // 3. Slow Cursor Movement Across Iris (Clearly observable local deformation)
    console.log('3/7: Recording Slow Cursor Movement (36 frames)...');
    const cx = 480;
    const cy = 300;
    await captureSequence('03_slow_cursor_movement', 36, async (i, total) => {
      const angle = (i / total) * Math.PI * 1.5;
      const radius = 75 + Math.sin(i * 0.25) * 20;
      const mx = cx + Math.cos(angle) * radius;
      const my = cy + Math.sin(angle) * radius;
      await recPage.mouse.move(mx, my);
    }, 80);

    // 4. Fast Cursor Movement Across Iris (Velocity boost)
    console.log('4/7: Recording Fast Cursor Movement (25 frames)...');
    await captureSequence('04_fast_cursor_movement', 25, async (i, total) => {
      const progress = i / (total - 1);
      const mx = cx - 120 + progress * 240;
      const my = cy - 40 + Math.sin(progress * Math.PI) * 60;
      await recPage.mouse.move(mx, my);
    }, 45);

    // 5. Cursor Leaving & Fibre Recovery (Smooth 600-800ms decay)
    console.log('5/7: Recording Cursor Leaving & Fibre Recovery (24 frames)...');
    await recPage.mouse.move(cx + 65, cy - 45);
    await new Promise(r => setTimeout(r, 200));
    await recPage.mouse.move(40, 40);
    await captureSequence('05_cursor_leave_recovery', 24, async () => {}, 45);

    // 6. Click-to-Reveal Interaction (Optical flare wave)
    console.log('6/7: Recording Click-to-Reveal Interaction (26 frames)...');
    await recPage.mouse.move(cx + 55, cy - 35);
    await new Promise(r => setTimeout(r, 100));
    await recPage.mouse.click(cx + 55, cy - 35);
    await captureSequence('06_click_optical_reveal', 26, async () => {}, 48);

    await recPage.close();

    // 7. Mobile Tap Interaction (390x650)
    console.log('7/7: Recording Mobile Tap Interaction (24 frames)...');
    const recMobPage = await browser.newPage();
    await recMobPage.setViewport({ width: 390, height: 650, deviceScaleFactor: 1, isMobile: true });
    await recMobPage.goto('http://localhost:3000/iris-lab?t=3.8&replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const mobX = 195 + 45;
    const mobY = 325 - 30;
    await recMobPage.evaluate((x, y) => {
      if (window.__irisLabTriggerClick) window.__irisLabTriggerClick(x, y);
    }, mobX, mobY);

    const framesTempMob = path.join(RECORDING_DIR, 'temp_07_mobile_tap');
    if (!fs.existsSync(framesTempMob)) fs.mkdirSync(framesTempMob, { recursive: true });
    const mobFrames = [];
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 50));
      const fPath = path.join(framesTempMob, `frame_${String(i).padStart(3, '0')}.png`);
      await recMobPage.screenshot({ path: fPath });
      mobFrames.push(fPath);
    }

    const mobGifOut = path.join(RECORDING_DIR, '07_mobile_tap_interaction.gif');
    const pyScriptMob = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${framesTempMob.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${mobGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=50, loop=0, optimize=True)
    print("Saved GIF:", r"${mobGifOut.replace(/\\/g, '/')}")
`;
    fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_mob.py'), pyScriptMob);
    execSync('python assemble_mob.py', { cwd: RECORDING_DIR });

    for (const f of mobFrames) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(framesTempMob)) fs.rmdirSync(framesTempMob);
    await recMobPage.close();

    console.log('\n=== ALL STILLS & 7 ANIMATED RECORDINGS SUCCESSFULLY PRODUCED ===');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
