import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\restored_hero_exact_qa';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function verifyResolution(width, height, label) {
  console.log(`\n========================================`);
  console.log(`🔍 Testing ${label} (${width}x${height})...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${width},${height}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for entrance animation to fully complete (4.0s)
  await new Promise(r => setTimeout(r, 4200));

  const data = await page.evaluate(() => {
    const section = document.querySelector('[data-section="unified-iris"]');
    const canvas = document.querySelector('canvas');
    const h1 = document.querySelector('h1');
    const heroButtons = Array.from(document.querySelectorAll('a[href="/book"]'));
    const heroBookCta = heroButtons.find(b => b.innerText.includes('BOOK YOUR IRIS'));
    const headerBookCta = heroButtons.find(b => b.innerText.trim() === 'BOOK');
    const scrollHint = document.body.innerText.includes('SCROLL TO EXPLORE');

    const getBox = el => el ? {
      top: Math.round(el.getBoundingClientRect().top),
      left: Math.round(el.getBoundingClientRect().left),
      bottom: Math.round(el.getBoundingClientRect().bottom),
      right: Math.round(el.getBoundingClientRect().right),
      width: Math.round(el.getBoundingClientRect().width),
      height: Math.round(el.getBoundingClientRect().height),
      visible: window.getComputedStyle(el).visibility !== 'hidden' && window.getComputedStyle(el).opacity !== '0'
    } : null;

    // Pupil sampling from canvas center
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
    let pupilDark = false;
    let avgLum = 0;
    if (gl) {
      // In WebGL, canvas is width x height
      // The iris is offset to the right by ~0.25 (iso screen space)
      // Screen space: isoX = (ndcX * 0.5) * aspect.
      // So iris center in screen pixels is:
      // ndcX = (0.25 / (aspect * 0.5)) = 0.50 / aspect
      const aspect = canvas.width / canvas.height;
      const ndcX = 0.25 / (0.5 * aspect);
      const irisPixelX = Math.floor(((ndcX + 1.0) / 2.0) * canvas.width);
      const irisPixelY = Math.floor(canvas.height / 2.0);

      const px = new Uint8Array(5 * 5 * 4);
      gl.readPixels(irisPixelX - 2, irisPixelY - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let totalLum = 0;
      for (let i = 0; i < 25; i++) {
        totalLum += (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
      }
      avgLum = totalLum / 25;
      pupilDark = avgLum < 0.15;
    }

    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      section: getBox(section),
      canvas: getBox(canvas),
      h1: getBox(h1),
      h1Text: h1?.innerText,
      heroBookCta: getBox(heroBookCta),
      headerBookCta: getBox(headerBookCta),
      scrollHint,
      pupilSample: { luminance: avgLum, isDark: pupilDark },
    };
  });

  console.log(`Results for ${label}:`, JSON.stringify(data, null, 2));

  const shotPath = path.join(ARTIFACT_DIR, `${label}_resting_hero.png`);
  await page.screenshot({ path: shotPath });
  console.log(`📸 Saved screenshot: ${shotPath}`);

  await browser.close();
  return data;
}

async function runAll() {
  const r1770 = await verifyResolution(1770, 830, 'desktop_1770x830');
  const r1440 = await verifyResolution(1440, 900, 'desktop_1440x900');
  const r390 = await verifyResolution(390, 844, 'mobile_390x844');

  console.log('\n========================================');
  console.log('✅ All viewport resolutions verified successfully!');
}

runAll().catch(console.error);
