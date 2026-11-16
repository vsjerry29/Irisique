import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\fixed_hero_and_gallery';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function verify() {
  console.log('🚀 Verifying Hero text visibility and Gallery/Collection overlap fix...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Initial 500ms resting hero
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '01_hero_at_600ms.png') });

  const heroCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cta = document.querySelector('a[href="/book"]');
    const heroTextContainer = h1 ? h1.closest('[class*="z-30"]') : null;
    return {
      h1Visible: !!h1 && h1.offsetParent !== null,
      h1Text: h1?.innerText,
      ctaVisible: !!cta && cta.offsetParent !== null,
      ctaText: cta?.innerText,
      containerOpacity: heroTextContainer ? window.getComputedStyle(heroTextContainer).opacity : null,
      containerZIndex: heroTextContainer ? window.getComputedStyle(heroTextContainer).zIndex : null,
    };
  });
  console.log('Hero at 600ms check:', JSON.stringify(heroCheck, null, 2));

  // 2. Entrance settled (at 3.5s)
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(OUT_DIR, '02_hero_settled.png') });

  // 3. Scroll to transition settled (at scroll = 1395)
  await page.evaluate(() => window.scrollTo(0, 1395));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '03_gallery_solo.png') });

  // 4. Click COUPLE tab
  await page.evaluate(() => {
    const coupleBtn = document.querySelector('button[data-tab="COUPLE"]');
    if (coupleBtn) coupleBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '04_gallery_couple_full.png') });

  const coupleCheck = await page.evaluate(() => {
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const art = document.querySelector('#art');
    const plateRect = plate ? plate.getBoundingClientRect() : null;
    const artRect = art ? art.getBoundingClientRect() : null;
    return {
      artScrollHeight: art ? art.scrollHeight : null,
      artClientHeight: art ? art.clientHeight : null,
      plateRect,
      plateFitsInViewport: plateRect ? (plateRect.bottom <= window.innerHeight) : false,
      windowHeight: window.innerHeight,
    };
  });
  console.log('Couple Gallery Plate Metrics:', JSON.stringify(coupleCheck, null, 2));

  // 5. Scroll naturally into Section 3 (Collection)
  // Pin distance was 155vh = ~1395px, plus container height = 900px, so collection begins around 2295px
  await page.evaluate(() => window.scrollTo(0, 1850));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '05_scroll_1850_dwell.png') });

  await page.evaluate(() => window.scrollTo(0, 2350));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '06_scroll_2350_collection_entry.png') });

  await page.evaluate(() => window.scrollTo(0, 2800));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '07_scroll_2800_collection_settled.png') });

  await browser.close();
  console.log('✅ Verification complete. All screenshots written to:', OUT_DIR);
}

verify().catch(console.error);
