import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\homepage';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

async function recordReloadProof() {
  console.log('Recording Reload Proof sequence...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });

  const tempDir = path.join(RECORDING_DIR, 'temp_reload_proof');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const framePaths = [];
  let frameIdx = 0;

  // 1. First Load
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // Capture 12 frames of first entrance
  for (let i = 0; i < 12; i++) {
    const t = (i / 11) * 3.8;
    await page.evaluate((seekT) => {
      if (window.__irisHomepageTimeline) {
        window.__irisHomepageTimeline.pause();
        window.__irisHomepageTimeline.seek(seekT);
      }
    }, t);
    await new Promise(r => setTimeout(r, 50));
    const fp = path.join(tempDir, `frame_${String(frameIdx++).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
    framePaths.push(fp);
  }

  // 2. Perform Browser Reload
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // Capture 16 frames of replayed entrance after reload
  for (let i = 0; i < 16; i++) {
    const t = (i / 15) * 3.8;
    await page.evaluate((seekT) => {
      if (window.__irisHomepageTimeline) {
        window.__irisHomepageTimeline.pause();
        window.__irisHomepageTimeline.seek(seekT);
      }
    }, t);
    await new Promise(r => setTimeout(r, 50));
    const fp = path.join(tempDir, `frame_${String(frameIdx++).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
    framePaths.push(fp);
  }

  const gifOut = path.join(RECORDING_DIR, '07_homepage_refresh_replay.gif');
  const artifactGifOut = path.join(ARTIFACTS_RECORDING_DIR, '07_homepage_refresh_replay.gif');
  const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${gifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=100, loop=0, optimize=False)
    imgs[0].save(r"${artifactGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=100, loop=0, optimize=False)
    print("Saved Reload Proof GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_reload.py'), pyScript);
  execSync('python assemble_reload.py', { cwd: RECORDING_DIR });

  for (const f of framePaths) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);

  await browser.close();
  console.log('Reload proof recording completed successfully.');
}

recordReloadProof();
