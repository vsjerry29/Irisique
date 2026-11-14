import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\anatomy';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\anatomy';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

[SCREENSHOT_DIR, ARTIFACTS_SCREENSHOT_DIR, RECORDING_DIR, ARTIFACTS_RECORDING_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename, clip = null) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  const opts = { path: p1 };
  if (clip) opts.clip = clip;
  await page.screenshot(opts);
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function verifyAnatomySection() {
  console.log('=== VERIFYING EYE ANATOMY SECTION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to #anatomy section
  console.log('Scrolling down to #anatomy section...');
  await page.evaluate(() => {
    const el = document.getElementById('anatomy');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  // 1. Capture Full Overview
  console.log('[Test 1] Capturing Desktop Overview...');
  await saveScreenshot(page, '01_anatomy_desktop_overview.png');

  // 2. Click Cornea
  console.log('[Test 2] Interacting with Cornea...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const corneaBtn = buttons.find(b => b.innerText.includes('CORNEA'));
    if (corneaBtn) corneaBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '02_anatomy_cornea_selected.png');

  // 3. Click Retina
  console.log('[Test 3] Interacting with Retina...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const retinaBtn = buttons.find(b => b.innerText.includes('RETINA'));
    if (retinaBtn) retinaBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '03_anatomy_retina_selected.png');

  // 4. Click Lens
  console.log('[Test 4] Interacting with Lens...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const lensBtn = buttons.find(b => b.innerText.includes('LENS'));
    if (lensBtn) lensBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '04_anatomy_lens_selected.png');

  // 5. Test View Mode Toggle: Pure Anatomy
  console.log('[Test 5] Toggling to Pure Anatomy mode...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pureBtn = buttons.find(b => b.innerText.includes('PURE ANATOMY'));
    if (pureBtn) pureBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '05_anatomy_pure_mode.png');

  // Switch back to Optics
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const optBtn = buttons.find(b => b.innerText.includes('OPTICAL CAUSTICS'));
    if (optBtn) optBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // 6. Test Filter: Neurosensory
  console.log('[Test 6] Filtering by Neurosensory...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const filterBtn = buttons.find(b => b.innerText.includes('NEUROSENSORY'));
    if (filterBtn) filterBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '06_anatomy_filtered_neuro.png');

  // Reset filter to All
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allBtn = buttons.find(b => b.innerText.includes('ALL STRUCTURES'));
    if (allBtn) allBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // 7. Mobile Viewport Test (iPhone 14)
  console.log('[Test 7] Testing Mobile Layout (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const el = document.getElementById('anatomy');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, '07_anatomy_mobile_view.png');

  // Mobile Interaction: Select Macula
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const maculaBtn = buttons.find(b => b.innerText.includes('MACULA'));
    if (maculaBtn) maculaBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(page, '08_anatomy_mobile_macula_selected.png');

  // 8. Capture GIF Walkthrough on Desktop
  console.log('[Test 8] Recording Animated Walkthrough GIF...');
  await page.setViewport({ width: 1200, height: 750, deviceScaleFactor: 1 });
  await page.evaluate(() => {
    const el = document.getElementById('anatomy');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));

  const tempGifDir = path.join(RECORDING_DIR, 'temp_anatomy_walkthrough');
  if (!fs.existsSync(tempGifDir)) fs.mkdirSync(tempGifDir, { recursive: true });

  const partsToCycle = ['cornea', 'pupil', 'iris', 'lens', 'retina', 'macula', 'optic-nerve'];
  let gifFrameIdx = 0;

  for (const partId of partsToCycle) {
    await page.evaluate((id) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.toLowerCase().includes(id.replace('-', ' ')));
      if (btn) btn.click();
    }, partId);

    // Capture 3 frames per part
    for (let f = 0; f < 3; f++) {
      await new Promise(r => setTimeout(r, 120));
      const fp = path.join(tempGifDir, `frame_${String(gifFrameIdx++).padStart(3, '0')}.png`);
      await page.screenshot({ path: fp });
    }
  }

  // Assemble GIF
  const gifOut = path.join(RECORDING_DIR, '09_anatomy_interaction_walkthrough.gif');
  const artifactGifOut = path.join(ARTIFACTS_RECORDING_DIR, '09_anatomy_interaction_walkthrough.gif');
  const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempGifDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${gifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=220, loop=0, optimize=False)
    imgs[0].save(r"${artifactGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=220, loop=0, optimize=False)
    print("Saved Anatomy Walkthrough GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_anatomy.py'), pyScript);
  execSync('python assemble_anatomy.py', { cwd: RECORDING_DIR });

  // Clean temp frames
  const fList = fs.readdirSync(tempGifDir);
  for (const f of fList) fs.unlinkSync(path.join(tempGifDir, f));
  fs.rmdirSync(tempGifDir);

  await browser.close();
  console.log('\n>>> EYE ANATOMY SECTION VERIFICATION COMPLETE! <<<');
}

verifyAnatomySection().catch(err => {
  console.error('Anatomy test error:', err);
  process.exit(1);
});
