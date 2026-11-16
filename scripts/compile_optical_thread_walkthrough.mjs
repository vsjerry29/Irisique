import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const FRAMES_DIR = 'D:/Irisique/recordings/optical_thread_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/recordings';

fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function recordWalkthrough() {
  console.log('Capturing interaction frames for Optical Thread Walkthrough...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  let frameIdx = 0;
  async function frame(delay = 100) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, '0');
    const fPath = path.join(FRAMES_DIR, `frame_${num}.png`);
    await page.screenshot({ path: fPath });
    await new Promise(r => setTimeout(r, delay));
  }

  // 1. Initial hero to gallery scroll transition (revealing Optical Thread entrance)
  const artTop = await page.evaluate(() => {
    const art = document.getElementById('art');
    return art ? art.getBoundingClientRect().top + window.scrollY : 1200;
  });

  // Step scroll towards #art
  for (let y = artTop - 600; y <= artTop + 150; y += 75) {
    await page.evaluate((topY) => window.scrollTo(0, topY), y);
    await frame(60);
  }

  // Settle at gallery midpoint (Solo active, Optical Thread leading to iris)
  await page.evaluate(() => {
    const plate = document.querySelector('[data-artwork-plate="true"]');
    if (plate) plate.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await frame(200);
  await frame(200);

  // 2. Click Couple tab -> watch Optical Thread respond & pulse
  await page.click('[data-composition="couple"]');
  for (let i = 0; i < 6; i++) {
    await frame(80);
  }

  // 3. Click Family tab -> watch Optical Thread respond & pulse
  await page.click('[data-composition="family"]');
  for (let i = 0; i < 6; i++) {
    await frame(80);
  }

  // 4. Click Explore Artwork -> Open Fullscreen Popup
  await page.click('[data-explore-btn="true"]');
  for (let i = 0; i < 4; i++) {
    await frame(120);
  }

  // Close popup
  await page.keyboard.press('Escape');
  await frame(150);

  // 5. Scroll down to Product Collection (revealing horizontal collection thread)
  const colTop = await page.evaluate(() => {
    const col = document.querySelector('[data-section="collection"]');
    return col ? col.getBoundingClientRect().top + window.scrollY : 3000;
  });

  for (let y = artTop + 300; y <= colTop; y += 120) {
    await page.evaluate((topY) => window.scrollTo(0, topY), y);
    await frame(60);
  }
  await frame(300);

  await browser.close();
  console.log(`Captured ${frameIdx} frames. Compiling animated GIF...`);

  // Compile GIF with python PIL
  const pyScript = `
from PIL import Image
import glob
import os

frames = sorted(glob.glob('${FRAMES_DIR.replace(/\\/g, '/')}/frame_*.png'))
images = []
for f in frames:
    im = Image.open(f).convert('RGB')
    im = im.resize((960, 600), Image.Resampling.LANCZOS)
    # Quantize to 128 colors to keep file size under 2MB
    im = im.quantize(colors=128, method=Image.Resampling.LANCZOS)
    images.append(im)

out_path_local = 'D:/Irisique/recordings/optical_thread_walkthrough.gif'
out_path_art = '${ARTIFACT_DIR.replace(/\\/g, '/')}/optical_thread_walkthrough.gif'

if images:
    images[0].save(out_path_local, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    images[0].save(out_path_art, save_all=True, append_images=images[1:], duration=120, loop=0, optimize=True)
    sz = os.path.getsize(out_path_local) / 1024
    print(f'Successfully compiled GIF: {sz:.1f} KB')
`;

  fs.writeFileSync('D:/Irisique/scripts/make_optical_gif.py', pyScript);
  execSync('python D:/Irisique/scripts/make_optical_gif.py', { stdio: 'inherit' });
}

recordWalkthrough().catch(console.error);
