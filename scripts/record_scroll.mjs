import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RECORDING_DIR = 'D:\\Irisique\\recordings';
const framesDir = path.join(RECORDING_DIR, 'temp_scroll');

if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2200));

  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * 780;
    await page.evaluate((scrollPos) => {
      window.scrollTo(0, scrollPos);
      window.dispatchEvent(new Event('scroll'));
    }, y);
    await new Promise(r => setTimeout(r, 120));
    await page.screenshot({ path: path.join(framesDir, `frame_${String(i).padStart(3, '0')}.png`) });
  }

  // Reverse scroll back to top
  for (let i = steps - 1; i >= 0; i--) {
    const y = (i / steps) * 780;
    await page.evaluate((scrollPos) => {
      window.scrollTo(0, scrollPos);
      window.dispatchEvent(new Event('scroll'));
    }, y);
    await new Promise(r => setTimeout(r, 90));
    const idx = steps + 1 + (steps - i);
    await page.screenshot({ path: path.join(framesDir, `frame_${String(idx).padStart(3, '0')}.png`) });
  }

  await browser.close();

  const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r'D:/Irisique/recordings/temp_scroll/frame_*.png'))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r'D:/Irisique/recordings/05_scroll_zoom.gif', save_all=True, append_images=imgs[1:], duration=90, loop=0, optimize=True)
    print('Updated 05_scroll_zoom.gif successfully!')
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_scroll.py'), pyScript);
  execSync('python assemble_scroll.py', { cwd: RECORDING_DIR });

  // Clean up frames
  for (const f of fs.readdirSync(framesDir)) {
    fs.unlinkSync(path.join(framesDir, f));
  }
  fs.rmdirSync(framesDir);
}

run().catch(console.error);
