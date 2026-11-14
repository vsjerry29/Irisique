import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots';
const RECORDING_DIR = 'D:\\Irisique\\recordings';

for (const dir of [SCREENSHOT_DIR, RECORDING_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function verify() {
  console.log('Launching Chrome for Procedural 3D Verification...');
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
    // -----------------------------------------------------------------
    // 1. Full Iris Screenshot (1440x900 Desktop)
    // -----------------------------------------------------------------
    console.log('1. Capturing Full Procedural 3D Iris (1440x900)...');
    const page1440 = await browser.newPage();
    await page1440.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page1440.goto('http://localhost:3002/?irisDebug=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000)); // wait for intro pullback to settle

    const shotFull = path.join(SCREENSHOT_DIR, '01_procedural_iris_full_1440x900.png');
    await page1440.screenshot({ path: shotFull });
    console.log(`Saved: ${shotFull}`);

    // -----------------------------------------------------------------
    // 2. Geometry-Only Screenshot (Proves real 3D geometry via normals)
    // -----------------------------------------------------------------
    console.log('2. Capturing Geometry-Only Mode (Normal vectors)...');
    await page1440.evaluate(() => {
      if (window.__irisSetDebug) {
        window.__irisSetDebug({ geometryOnly: true, wireframe: false, disableMaterials: false });
      }
    });
    await new Promise(r => setTimeout(r, 400));
    const shotGeo = path.join(SCREENSHOT_DIR, '02_procedural_iris_geometry_only.png');
    await page1440.screenshot({ path: shotGeo });
    console.log(`Saved: ${shotGeo}`);

    // -----------------------------------------------------------------
    // 3. Wireframe Screenshot (Proves real triangles and meshes)
    // -----------------------------------------------------------------
    console.log('3. Capturing Wireframe Mode (Actual triangles)...');
    await page1440.evaluate(() => {
      if (window.__irisSetDebug) {
        window.__irisSetDebug({ geometryOnly: false, wireframe: true, disableMaterials: false });
      }
    });
    await new Promise(r => setTimeout(r, 400));
    const shotWire = path.join(SCREENSHOT_DIR, '03_procedural_iris_wireframe.png');
    await page1440.screenshot({ path: shotWire });
    console.log(`Saved: ${shotWire}`);

    // -----------------------------------------------------------------
    // 4. Disable Materials (Clay Mode)
    // -----------------------------------------------------------------
    console.log('4. Capturing Disable Materials Mode (Clay)...');
    await page1440.evaluate(() => {
      if (window.__irisSetDebug) {
        window.__irisSetDebug({ geometryOnly: false, wireframe: false, disableMaterials: true });
      }
    });
    await new Promise(r => setTimeout(r, 400));
    const shotClay = path.join(SCREENSHOT_DIR, '04_procedural_iris_clay_mode.png');
    await page1440.screenshot({ path: shotClay });
    console.log(`Saved: ${shotClay}`);

    // Reset debug back to normal visual
    await page1440.evaluate(() => {
      if (window.__irisSetDebug) {
        window.__irisSetDebug({ geometryOnly: false, wireframe: false, disableMaterials: false });
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // -----------------------------------------------------------------
    // 5. Extreme Macro Close-Up Screenshot (Showing individual strands)
    // -----------------------------------------------------------------
    console.log('5. Capturing Extreme Macro Close-Up of Individual Strands...');
    // Zoom camera in to macro distance z=0.55 looking at 9 o'clock icy-cyan & amber strands
    await page1440.evaluate(() => {
      window.scrollTo(0, 0);
    });
    // Trigger close-up camera replay
    await page1440.evaluate(() => {
      if (window.__irisReplayIntro) window.__irisReplayIntro();
    });
    // Capture during the initial close-up hold (first 250ms)
    await new Promise(r => setTimeout(r, 150));
    const shotMacro = path.join(SCREENSHOT_DIR, '05_procedural_iris_macro_strands_closeup.png');
    await page1440.screenshot({ path: shotMacro });
    console.log(`Saved: ${shotMacro}`);

    await page1440.close();

    // -----------------------------------------------------------------
    // 6. Mobile 390x844 Screenshot
    // -----------------------------------------------------------------
    console.log('6. Capturing Mobile 390x844 Viewport...');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pageMobile.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2900));
    const shotMobile = path.join(SCREENSHOT_DIR, '06_procedural_iris_mobile_390x844.png');
    await pageMobile.screenshot({ path: shotMobile });
    console.log(`Saved: ${shotMobile}`);
    await pageMobile.close();

    // -----------------------------------------------------------------
    // 7. Interactive Feature Recordings (Idle, Hover, Scroll)
    // -----------------------------------------------------------------
    console.log('7. Capturing Real 3D Interactive Feature Recordings...');
    const recPage = await browser.newPage();
    await recPage.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await recPage.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2800));

    const framesTemp = path.join(RECORDING_DIR, 'temp_procedural');
    if (!fs.existsSync(framesTemp)) fs.mkdirSync(framesTemp, { recursive: true });

    const captureSequence = async (name, frameCount, stepFn, delayMs = 60) => {
      console.log(`Recording 3D sequence: ${name} (${frameCount} frames)...`);
      const framePaths = [];
      for (let i = 0; i < frameCount; i++) {
        if (stepFn) await stepFn(i, frameCount);
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
    print("Saved 3D GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
      fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_procedural.py'), pyScript);
      execSync('python assemble_procedural.py', { cwd: RECORDING_DIR });

      for (const f of framePaths) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
    };

    // A. 5-second Idle Animation (Living strand flex & biological breathing)
    console.log('A. Recording 5s Living Procedural Idle...');
    await captureSequence('01_procedural_3d_idle', 45, async () => {}, 100);

    // B. Pointer 3D Deflection (Nearby strands bending)
    console.log('B. Recording Pointer 3D Deflection...');
    const cx = 793;
    const cy = 352;
    await captureSequence('02_procedural_3d_hover', 40, async (i, total) => {
      const angle = (i / total) * Math.PI * 2;
      const radius = 110 + Math.sin(i * 0.4) * 35;
      const mx = cx + Math.cos(angle) * radius;
      const my = cy + Math.sin(angle) * radius;
      await recPage.mouse.move(mx, my);
    }, 70);

    // C. Scroll-Driven 3D Camera Plunge into Pupil
    console.log('C. Recording 3D Camera Scroll Plunge...');
    await captureSequence('03_procedural_3d_scroll_zoom', 30, async (i, total) => {
      const scrollY = (i / total) * 780;
      await recPage.evaluate((y) => {
        window.scrollTo(0, y);
        window.dispatchEvent(new Event('scroll'));
      }, scrollY);
    }, 80);

    await recPage.close();
    console.log('ALL PROCEDURAL 3D VERIFICATIONS AND RECORDINGS COMPLETE!');
  } finally {
    await browser.close();
  }
}

verify().catch(err => {
  console.error('Procedural verification error:', err);
  process.exit(1);
});
