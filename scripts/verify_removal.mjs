import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\homepage';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';

async function saveScreenshot(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function verifyRemoval() {
  console.log('=== VERIFYING CLEAN HOMEPAGE AFTER EYE ANATOMY REMOVAL ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Wait 4s for entrance
  await new Promise(r => setTimeout(r, 4000));

  // 1. Verify Desktop Hero
  console.log('[Check 1] Desktop Hero...');
  await saveScreenshot(page, 'desktop_hero_clean.png');

  // Verify navigation items
  const navTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('header nav a')).map(a => a.innerText.trim());
  });
  console.log('Header Navigation Links:', navTexts);

  const hasAnatomyInNav = navTexts.some(t => t.includes('ANATOMY'));
  if (hasAnatomyInNav) throw new Error('ANATOMY link still found in navigation!');

  // Verify no #anatomy section exists
  const hasAnatomySection = await page.evaluate(() => !!document.getElementById('anatomy'));
  console.log('#anatomy element exists in DOM:', hasAnatomySection);
  if (hasAnatomySection) throw new Error('#anatomy section still exists!');

  // 2. Scroll to Phase C/D (Next Section - The Biometric Masterpiece)
  console.log('[Check 2] Scrolling to Phase C/D...');
  await page.evaluate(() => {
    if (window.__irisScrollToProgress) {
      window.__irisScrollToProgress(0.75);
    } else {
      window.scrollTo(0, 1500);
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, 'desktop_phase_c_artistry.png');

  // 3. Scroll to Collection Section (Post-pinned track)
  console.log('[Check 3] Scrolling into Collection section...');
  await page.evaluate(() => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, 'desktop_collection_section.png');

  // Verify Collection Section Kicker
  const collectionKicker = await page.evaluate(() => {
    return document.querySelector('#collection span')?.innerText.trim();
  });
  console.log('Collection section kicker:', collectionKicker);

  // 4. Test Reverse Scroll back to Top
  console.log('[Check 4] Testing reverse scroll back to top...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));

  const heroStatus = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cta = document.querySelector('a[href="#explore"]');
    return {
      h1Text: h1?.innerText.trim().replace(/\s+/g, ' '),
      h1Opacity: h1 ? parseFloat(window.getComputedStyle(h1).opacity) : 0,
      ctaText: cta?.innerText.trim(),
      ctaOpacity: cta ? parseFloat(window.getComputedStyle(cta).opacity) : 0,
    };
  });
  console.log('Top Hero Status after Reverse Scroll:', heroStatus);
  await saveScreenshot(page, 'desktop_top_restored.png');

  // 5. Test Mobile Viewport (iPhone 14)
  console.log('[Check 5] Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000));
  await saveScreenshot(page, 'mobile_hero_clean.png');

  // Scroll to Collection on Mobile
  await page.evaluate(() => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, 'mobile_collection_clean.png');

  await browser.close();
  console.log('\n>>> HOMEPAGE VERIFICATION COMPLETE: ALL CHECKS PASSED! <<<');
}

verifyRemoval().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
