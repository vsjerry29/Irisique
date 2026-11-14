import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_PATH = 'D:\\Irisique\\screenshots\\anatomy_svg_preview.png';

async function testOverlay() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Test HTML with the image, SVG lines, and labels
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #030304; color: #f0f0f2; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px; }
    .container { width: 1200px; position: relative; background: #060609; border: 1px solid #1a1a24; padding: 30px; }
    .header { margin-bottom: 24px; }
    .kicker { font-family: monospace; font-size: 11px; letter-spacing: 0.28em; color: #7ec8e3; text-transform: uppercase; }
    .title { font-size: 38px; font-weight: 300; letter-spacing: -0.03em; color: #f7f7fa; text-transform: uppercase; margin-top: 6px; }
    .stage { position: relative; width: 100%; aspect-ratio: 16/9; background: #030304; border: 1px solid #14141e; overflow: hidden; }
    .bg-img { width: 100%; height: 100%; object-fit: contain; }
    .svg-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="kicker">02 / OPTICAL ARCHITECTURE</span>
      <h2 class="title">THE ANATOMY OF VISION</h2>
    </div>
    <div class="stage">
      <img class="bg-img" src="file:///D:/Irisique/public/assets/anatomy/eye-anatomy-optics.webp" />
      <svg class="svg-layer" viewBox="0 0 1376 768">
        <!-- Cornea (380, 384) -->
        <circle cx="380" cy="384" r="5" fill="#7ec8e3" />
        <circle cx="380" cy="384" r="10" stroke="#7ec8e3" stroke-opacity="0.4" fill="none" />
        <path d="M 120 280 L 260 280 L 380 384" stroke="#7ec8e3" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="110" y="275" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2" text-anchor="end">CORNEA // 01</text>
        <text x="110" y="295" fill="#7ec8e3" font-size="9" font-family="monospace" letter-spacing="1" text-anchor="end">ANTERIOR REFRACTIVE DOME</text>

        <!-- Pupil (485, 384) -->
        <circle cx="485" cy="384" r="5" fill="#7ec8e3" />
        <path d="M 120 384 L 380 384 L 485 384" stroke="#7ec8e3" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="110" y="380" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2" text-anchor="end">PUPIL // 02</text>
        <text x="110" y="400" fill="#7ec8e3" font-size="9" font-family="monospace" letter-spacing="1" text-anchor="end">DYNAMIC APERTURE</text>

        <!-- Iris (515, 465) -->
        <circle cx="515" cy="465" r="5" fill="#e09848" />
        <path d="M 120 488 L 320 488 L 515 465" stroke="#e09848" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="110" y="484" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2" text-anchor="end">IRIS // 03</text>
        <text x="110" y="504" fill="#e09848" font-size="9" font-family="monospace" letter-spacing="1" text-anchor="end">BIOMETRIC STROMA</text>

        <!-- Lens (560, 384) -->
        <circle cx="560" cy="384" r="5" fill="#7ec8e3" />
        <path d="M 360 80 L 460 80 L 560 384" stroke="#7ec8e3" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="350" y="75" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2" text-anchor="end">LENS // 04</text>
        <text x="350" y="95" fill="#7ec8e3" font-size="9" font-family="monospace" letter-spacing="1" text-anchor="end">CRYSTALLINE BICONVEX</text>

        <!-- Retina (840, 240) -->
        <circle cx="840" cy="240" r="5" fill="#7ec8e3" />
        <path d="M 840 240 L 980 140 L 1150 140" stroke="#7ec8e3" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="1160" y="135" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2">RETINA // 05</text>
        <text x="1160" y="155" fill="#7ec8e3" font-size="9" font-family="monospace" letter-spacing="1">PHOTONIC TRANSDUCTION</text>

        <!-- Macula (905, 384) -->
        <circle cx="905" cy="384" r="5" fill="#e09848" />
        <path d="M 905 384 L 1020 384 L 1150 384" stroke="#e09848" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="1160" y="380" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2">MACULA // 06</text>
        <text x="1160" y="400" fill="#e09848" font-size="9" font-family="monospace" letter-spacing="1">CHROMATIC FOVEA</text>

        <!-- Optic Nerve (1030, 470) -->
        <circle cx="1030" cy="470" r="5" fill="#7ec8e3" />
        <path d="M 1030 470 L 1100 560 L 1150 560" stroke="#7ec8e3" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="1160" y="555" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2">OPTIC NERVE // 07</text>
        <text x="1160" y="575" fill="#7ec8e3" font-size="9" font-family="monospace" letter-spacing="1">1.2M AXON BUNDLE</text>

        <!-- Sclera (740, 140) -->
        <circle cx="740" cy="140" r="5" fill="#9e9eb0" />
        <path d="M 740 140 L 800 80 L 980 80" stroke="#9e9eb0" stroke-width="1.2" stroke-opacity="0.7" fill="none" />
        <text x="990" y="75" fill="#f7f7fa" font-size="12" font-family="monospace" letter-spacing="2">SCLERA // 08</text>
        <text x="990" y="95" fill="#9e9eb0" font-size="9" font-family="monospace" letter-spacing="1">PROTECTIVE COLLAGEN TUNIC</text>
      </svg>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT_PATH });
  await browser.close();
  console.log('Saved preview to', OUT_PATH);
}

testOverlay().catch(console.error);
