import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_DIR = 'D:\\Irisique\\recordings\\qa';
const ARTIFACTS_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function run() {
  console.log('Recording full homepage scroll lifecycle...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2200));

  const tempDir = path.join(LOCAL_DIR, 'frames');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  console.log('Max scrollable height:', maxScroll);

  // Sample points covering downward scroll (24 frames) and upward scroll (10 frames)
  const steps = [];
  const downCount = 28;
  for (let i = 0; i <= downCount; i++) {
    steps.push(Math.round((i / downCount) * maxScroll));
  }
  // Upward scroll samples
  const upCount = 8;
  for (let i = 1; i <= upCount; i++) {
    steps.push(Math.round(maxScroll - (i / upCount) * maxScroll));
  }

  let frameIdx = 0;
  for (const y of steps) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));
    const fp = path.join(tempDir, `frame_${String(frameIdx).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
    frameIdx++;
  }

  console.log(`Captured ${frameIdx} frames. Compiling animated GIF via Python PIL...`);
  const pLocal = path.join(LOCAL_DIR, '04_full_homepage_qa_scroll.gif');
  const pArtifact = path.join(ARTIFACTS_DIR, '04_full_homepage_qa_scroll.gif');

  const pyCode = `
from PIL import Image
import glob

frames = sorted(glob.glob(r"${tempDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = []
for f in frames:
    im = Image.open(f)
    im.thumbnail((800, 500), Image.Resampling.LANCZOS)
    imgs.append(im)

if imgs:
    imgs[0].save(
        r"${pLocal.replace(/\\/g, '/')}",
        save_all=True,
        append_images=imgs[1:],
        duration=220,
        loop=0,
        optimize=True
    )
    import shutil
    shutil.copyfile(r"${pLocal.replace(/\\/g, '/')}", r"${pArtifact.replace(/\\/g, '/')}")
    print("GIF saved successfully!")
`;

  execSync(`python -c "${pyCode.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
  const size = fs.statSync(pLocal).size;
  console.log(`[PASS] Final Recording GIF: ${pLocal} (${size} bytes)`);

  await browser.close();
}

run().catch(console.error);
