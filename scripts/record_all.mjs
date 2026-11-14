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

async function run() {
  console.log('Launching Chrome for full capture pass...');
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
    // PASS 1: Viewport Screenshots (with full settle + typography)
    // -------------------------------------------------------------
    console.log('=== PASS 1: Capturing Viewport Screenshots ===');

    // 1440x900 Desktop Reference
    const page1440 = await browser.newPage();
    await page1440.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page1440.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2900));
    const shot1440 = path.join(SCREENSHOT_DIR, 'hero-desktop-1440x900.png');
    await page1440.screenshot({ path: shot1440 });
    console.log(`Saved: ${shot1440}`);

    // Test Hover
    console.log('Capturing hover state at 1440x900...');
    await page1440.mouse.move(892, 441);
    await new Promise(r => setTimeout(r, 120));
    await page1440.mouse.move(820, 390, { steps: 8 });
    await new Promise(r => setTimeout(r, 250));
    const shotHover = path.join(SCREENSHOT_DIR, 'hero-desktop-hover.png');
    await page1440.screenshot({ path: shotHover });
    console.log(`Saved: ${shotHover}`);

    // Test Reveal
    console.log('Capturing reveal state at 1440x900...');
    await page1440.mouse.click(820, 390);
    await new Promise(r => setTimeout(r, 350));
    const shotReveal = path.join(SCREENSHOT_DIR, 'hero-desktop-reveal.png');
    await page1440.screenshot({ path: shotReveal });
    console.log(`Saved: ${shotReveal}`);

    // Test Scroll Zoom
    console.log('Capturing scroll zoom at 1440x900...');
    await page1440.evaluate(() => {
      window.scrollTo(0, 500);
      window.dispatchEvent(new Event('scroll'));
    });
    await new Promise(r => setTimeout(r, 350));
    const shotScroll = path.join(SCREENSHOT_DIR, 'hero-desktop-scroll-zoom.png');
    await page1440.screenshot({ path: shotScroll });
    console.log(`Saved: ${shotScroll}`);
    await page1440.close();

    // 1920x1080 Desktop
    const page1920 = await browser.newPage();
    await page1920.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page1920.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2900));
    const shot1920 = path.join(SCREENSHOT_DIR, 'hero-desktop-1920x1080.png');
    await page1920.screenshot({ path: shot1920 });
    console.log(`Saved: ${shot1920}`);
    await page1920.close();

    // 390x844 Mobile
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pageMobile.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2900));
    const shot390 = path.join(SCREENSHOT_DIR, 'hero-mobile-390x844.png');
    await pageMobile.screenshot({ path: shot390 });
    console.log(`Saved: ${shot390}`);

    // Mobile tap
    await pageMobile.tap('canvas');
    await new Promise(r => setTimeout(r, 350));
    const shotMobileTap = path.join(SCREENSHOT_DIR, 'hero-mobile-tap.png');
    await pageMobile.screenshot({ path: shotMobileTap });
    console.log(`Saved: ${shotMobileTap}`);
    await pageMobile.close();

    // -------------------------------------------------------------
    // PASS 2: Interactive Feature Recordings
    // -------------------------------------------------------------
    console.log('=== PASS 2: Capturing Interactive Recordings ===');
    const recPage = await browser.newPage();
    await recPage.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await recPage.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    const framesTemp = path.join(RECORDING_DIR, 'temp_frames');
    if (!fs.existsSync(framesTemp)) fs.mkdirSync(framesTemp, { recursive: true });

    const captureSequence = async (name, frameCount, stepFn, delayMs = 60) => {
      console.log(`Recording sequence: ${name} (${frameCount} frames)...`);
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
    print("Saved GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
      fs.writeFileSync(path.join(RECORDING_DIR, 'assemble.py'), pyScript);
      execSync('python assemble.py', { cwd: RECORDING_DIR });

      for (const f of framePaths) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
    };

    // 1. Cinematic Intro
    console.log('1. Recording Cinematic Intro...');
    await recPage.evaluate(() => {
      if (window.__irisReplayIntro) window.__irisReplayIntro();
    });
    await captureSequence('01_cinematic_intro', 32, async () => {}, 65);
    await new Promise(r => setTimeout(r, 1200));

    // 2. Idle Animation
    console.log('2. Recording Idle Animation (5s)...');
    await captureSequence('02_idle_animation', 50, async () => {}, 100);

    // 3. Pointer Interaction (Localized to nearby fiber structures)
    console.log('3. Recording Pointer Interaction...');
    const cx = 793;
    const cy = 352;
    await captureSequence('03_pointer_interaction', 45, async (i, total) => {
      const angle = (i / total) * Math.PI * 2;
      const radius = 100 + Math.sin(i * 0.4) * 40;
      const mx = cx + Math.cos(angle) * radius;
      const my = cy + Math.sin(angle) * radius;
      await recPage.mouse.move(mx, my);
    }, 70);

    // 4. Click to Reveal
    console.log('4. Recording Click-to-Reveal...');
    await recPage.mouse.move(cx + 45, cy - 30);
    await recPage.mouse.click(cx + 45, cy - 30);
    await captureSequence('04_click_reveal', 25, async () => {}, 60);

    await recPage.close();
    console.log('All captures and recordings completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
