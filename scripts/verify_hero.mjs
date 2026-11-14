import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome via puppeteer-core...');
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
    // 1. Desktop 1440x900
    console.log('Testing 1440x900 Viewport...');
    const page1440 = await browser.newPage();
    await page1440.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    
    // Listen to console logs
    page1440.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page1440.on('pageerror', err => console.error('PAGE ERROR:', err));

    await page1440.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Wait for the cinematic intro to settle (approx 2.4s)
    await new Promise(r => setTimeout(r, 2600));

    // Capture resting 1440x900 hero
    const shot1440 = path.join(SCREENSHOT_DIR, 'hero-desktop-1440x900.png');
    await page1440.screenshot({ path: shot1440 });
    console.log(`Saved: ${shot1440}`);

    // Test Pointer Movement across the iris
    console.log('Testing pointer interaction...');
    // Move mouse over iris (iris is centered around 62% of 1440 = 892, 49% of 900 = 441)
    await page1440.mouse.move(892, 441);
    await new Promise(r => setTimeout(r, 100));
    await page1440.mouse.move(820, 390, { steps: 10 });
    await new Promise(r => setTimeout(r, 200));

    const shotHover = path.join(SCREENSHOT_DIR, 'hero-desktop-hover.png');
    await page1440.screenshot({ path: shotHover });
    console.log(`Saved: ${shotHover}`);

    // Test Click to Reveal
    console.log('Testing click to reveal...');
    await page1440.mouse.click(840, 420);
    await new Promise(r => setTimeout(r, 350)); // middle of reveal wave
    const shotReveal = path.join(SCREENSHOT_DIR, 'hero-desktop-reveal.png');
    await page1440.screenshot({ path: shotReveal });
    console.log(`Saved: ${shotReveal}`);

    // Test Scroll Zoom
    console.log('Testing scroll-driven pupil zoom...');
    await page1440.evaluate(() => {
      window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 300));
    const shotScroll = path.join(SCREENSHOT_DIR, 'hero-desktop-scroll-zoom.png');
    await page1440.screenshot({ path: shotScroll });
    console.log(`Saved: ${shotScroll}`);

    await page1440.close();

    // 2. Desktop 1920x1080
    console.log('Testing 1920x1080 Viewport...');
    const page1920 = await browser.newPage();
    await page1920.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page1920.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2600));

    const shot1920 = path.join(SCREENSHOT_DIR, 'hero-desktop-1920x1080.png');
    await page1920.screenshot({ path: shot1920 });
    console.log(`Saved: ${shot1920}`);
    await page1920.close();

    // 3. Mobile 390x844
    console.log('Testing Mobile 390x844 Viewport...');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pageMobile.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2600));

    const shot390 = path.join(SCREENSHOT_DIR, 'hero-mobile-390x844.png');
    await pageMobile.screenshot({ path: shot390 });
    console.log(`Saved: ${shot390}`);

    // Mobile tap interaction
    console.log('Testing mobile tap...');
    await pageMobile.tap('canvas');
    await new Promise(r => setTimeout(r, 350));
    const shotMobileTap = path.join(SCREENSHOT_DIR, 'hero-mobile-tap.png');
    await pageMobile.screenshot({ path: shotMobileTap });
    console.log(`Saved: ${shotMobileTap}`);

    await pageMobile.close();

    console.log('All screenshots and interaction tests successfully captured!');
  } finally {
    await browser.close();
  }
}

capture().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
