import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\layers';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\layers';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

[SCREENSHOT_DIR, ARTIFACTS_SCREENSHOT_DIR, RECORDING_DIR, ARTIFACTS_RECORDING_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function testIrisLayers() {
  console.log('=== STARTING MANDATORY IRIS LAYERS VISUAL TESTING ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Loading homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Find scrollTrigger start and end for #iris-layers
  const layersTrigger = await page.evaluate(() => {
    const el = document.getElementById('iris-layers');
    const st = window.__irisLayersTimeline?.scrollTrigger;
    return {
      exists: !!el,
      start: st?.start ?? 0,
      end: st?.end ?? 0,
    };
  });
  console.log('Iris Layers ScrollTrigger status:', layersTrigger);

  // Helper to seek IrisLayers timeline directly for frame-accurate states
  const seekLayers = async (p) => {
    await page.evaluate((prog) => {
      const tl = window.__irisLayersTimeline;
      if (tl) {
        tl.pause();
        tl.progress(prog);
      }
    }, p);
    await new Promise(r => setTimeout(r, 100));
  };

  // Scroll into #iris-layers
  await page.evaluate(() => {
    const el = document.getElementById('iris-layers');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));

  // ─── 1. Exact 7 Required Visual States ───
  console.log('\n--- CAPTURING 7 MANDATORY VISUAL STATES ---');

  // State 1: Fully assembled iris (Phase 01: p = 0.05)
  console.log('[State 1] Fully assembled iris...');
  await seekLayers(0.05);
  await saveScreenshot(page, '01_layers_assembled.png');

  // State 2: Initial separation (Phase 02: p = 0.22)
  console.log('[State 2] Initial separation...');
  await seekLayers(0.22);
  await saveScreenshot(page, '02_layers_initial_separation.png');

  // State 3: Camera travelling through the layers (Phase 03: p = 0.42)
  console.log('[State 3] Camera travelling through the layers...');
  await seekLayers(0.42);
  await saveScreenshot(page, '03_layers_travelling_through.png');

  // State 4: Extreme close-up of the fibre network (Phase 03/04: p = 0.58)
  console.log('[State 4] Extreme close-up of the fibre network...');
  await seekLayers(0.58);
  await saveScreenshot(page, '04_layers_fibre_extreme_macro.png');

  // State 5: Floating microscopic composition (Phase 04: p = 0.70)
  console.log('[State 5] Floating microscopic world...');
  await seekLayers(0.70);
  await saveScreenshot(page, '05_layers_microscopic_world.png');

  // State 6: Reassembled iris (Phase 05: p = 0.88)
  console.log('[State 6] Reassembled iris...');
  await seekLayers(0.88);
  await saveScreenshot(page, '06_layers_reassembly.png');

  // State 7: Seamless exit (Phase 06: p = 0.98)
  console.log('[State 7] Seamless exit transition...');
  await seekLayers(0.98);
  await saveScreenshot(page, '07_layers_seamless_exit.png');

  // ─── 2. Record Forward Scroll Animation GIF ───
  console.log('\n--- RECORDING FORWARD SCROLL ANIMATION GIF ---');
  const tempFwdDir = path.join(RECORDING_DIR, 'temp_fwd');
  if (!fs.existsSync(tempFwdDir)) fs.mkdirSync(tempFwdDir, { recursive: true });

  const totalFrames = 32;
  for (let i = 0; i < totalFrames; i++) {
    const p = i / (totalFrames - 1);
    await seekLayers(p);
    const fp = path.join(tempFwdDir, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
  }

  const fwdGifOut = path.join(RECORDING_DIR, '01_iris_layers_forward_scroll.gif');
  const artifactFwdGifOut = path.join(ARTIFACTS_RECORDING_DIR, '01_iris_layers_forward_scroll.gif');
  const pyScriptFwd = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempFwdDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${fwdGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=85, loop=0, optimize=False)
    imgs[0].save(r"${artifactFwdGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=85, loop=0, optimize=False)
    print("Saved Forward Scroll GIF:", r"${fwdGifOut.replace(/\\/g, '/')}")
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_fwd.py'), pyScriptFwd);
  execSync('python assemble_fwd.py', { cwd: RECORDING_DIR });

  // Clean temp frames
  fs.readdirSync(tempFwdDir).forEach(f => fs.unlinkSync(path.join(tempFwdDir, f)));
  fs.rmdirSync(tempFwdDir);

  // ─── 3. Record Reverse Scroll Animation GIF ───
  console.log('\n--- RECORDING REVERSE SCROLL ANIMATION GIF ---');
  const tempRevDir = path.join(RECORDING_DIR, 'temp_rev');
  if (!fs.existsSync(tempRevDir)) fs.mkdirSync(tempRevDir, { recursive: true });

  for (let i = 0; i < totalFrames; i++) {
    const p = 1.0 - i / (totalFrames - 1);
    await seekLayers(p);
    const fp = path.join(tempRevDir, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
  }

  const revGifOut = path.join(RECORDING_DIR, '02_iris_layers_reverse_scroll.gif');
  const artifactRevGifOut = path.join(ARTIFACTS_RECORDING_DIR, '02_iris_layers_reverse_scroll.gif');
  const pyScriptRev = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempRevDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${revGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=85, loop=0, optimize=False)
    imgs[0].save(r"${artifactRevGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=85, loop=0, optimize=False)
    print("Saved Reverse Scroll GIF:", r"${revGifOut.replace(/\\/g, '/')}")
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_rev.py'), pyScriptRev);
  execSync('python assemble_rev.py', { cwd: RECORDING_DIR });

  fs.readdirSync(tempRevDir).forEach(f => fs.unlinkSync(path.join(tempRevDir, f)));
  fs.rmdirSync(tempRevDir);

  // ─── 4. Test Mobile Responsive Viewport (390x844) ───
  console.log('\n--- TESTING MOBILE RESPONSIVE LAYOUT (390x844) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const el = document.getElementById('iris-layers');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 400));

  // Mobile Assembled
  await seekLayers(0.05);
  await saveScreenshot(page, '08_layers_mobile_assembled.png');

  // Mobile Separated (Phase 04)
  await seekLayers(0.65);
  await saveScreenshot(page, '09_layers_mobile_separated.png');

  await browser.close();
  console.log('\n>>> IRIS LAYERS TESTING COMPLETED SUCCESSFULLY! <<<');
}

testIrisLayers().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
