import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_RECORDING_DIR = 'D:\\Irisique\\recordings\\master';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to couple section
  await page.evaluate(() => {
    const el = document.getElementById('couple');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  const tempDir = path.join(LOCAL_RECORDING_DIR, 'temp_couple');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const totalFrames = 18;
  const startY = await page.evaluate(() => window.scrollY);

  for (let i = 0; i < totalFrames; i++) {
    const scrollStep = startY + (i / (totalFrames - 1)) * 1400; // scroll through attraction & connection
    await page.evaluate((y) => window.scrollTo(0, y), scrollStep);
    await new Promise(r => setTimeout(r, 120));
    const fp = path.join(tempDir, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: fp });
  }

  const pLocal = path.join(LOCAL_RECORDING_DIR, '03_couple_attraction.gif');
  const pArtifact = path.join(ARTIFACTS_RECORDING_DIR, '03_couple_attraction.gif');
  const pyCode = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    small_imgs = [img.resize((960, 600), Image.Resampling.LANCZOS) for img in imgs]
    small_imgs[0].save(r"${pLocal.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=150, loop=0, optimize=False)
    small_imgs[0].save(r"${pArtifact.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=150, loop=0, optimize=False)
    print("Saved 03_couple_attraction.gif successfully.")
`;
  const pyFile = path.join(LOCAL_RECORDING_DIR, 'assemble_couple.py');
  fs.writeFileSync(pyFile, pyCode);
  execSync(`python "${pyFile}"`, { cwd: LOCAL_RECORDING_DIR });

  fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
  fs.rmdirSync(tempDir);

  await browser.close();
}

run();
