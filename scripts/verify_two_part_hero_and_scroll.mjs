import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\two_part_hero_scroll_qa';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runTest() {
  console.log('🚀 Running Two-Part Hero + Scroll Sequence Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1770,830']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1770, height: 830, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Wait for entrance animation to finish (4.2s)
  await new Promise(r => setTimeout(r, 4200));

  // Check resting hero
  const restingCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const heroCta = Array.from(document.querySelectorAll('a[href="/book"]')).find(a => a.innerText.includes('BOOK YOUR IRIS'));
    const scrollHint = document.body.innerText.includes('SCROLL TO EXPLORE');
    return {
      h1Visible: !!h1 && h1.offsetParent !== null,
      h1Top: h1?.getBoundingClientRect().top,
      ctaVisible: !!heroCta && heroCta.offsetParent !== null,
      ctaTop: heroCta?.getBoundingClientRect().top,
      scrollHint,
    };
  });
  console.log('Resting Hero Check at 1770x830:', restingCheck);

  const shot1 = path.join(ARTIFACT_DIR, '01_resting_hero_1770x830.png');
  await page.screenshot({ path: shot1 });
  console.log('📸 01_resting_hero_1770x830.png captured');

  // Also capture at 1440x900
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await new Promise(r => setTimeout(r, 600));
  const shot1440 = path.join(ARTIFACT_DIR, '01_resting_hero_1440x900.png');
  await page.screenshot({ path: shot1440 });
  console.log('📸 01_resting_hero_1440x900.png captured');

  // Reset viewport to 1440x900 for sequence testing
  const stMetrics = await page.evaluate(() => {
    const triggers = window.ScrollTrigger?.getAll() || [];
    const heroTrigger = triggers.find((t) => t.trigger?.dataset?.section === 'unified-iris') || triggers[0];
    return {
      start: heroTrigger?.start || 0,
      end: heroTrigger?.end || 1035,
      totalTravel: (heroTrigger?.end || 1035) - (heroTrigger?.start || 0),
    };
  });
  console.log('ScrollTrigger travel:', stMetrics);

  const steps = [
    { label: '02_rotation_p10_deg35', p: 0.10, desc: 'Clockwise rotation ~35 deg on right side, type gliding out' },
    { label: '03_rotation_p20_deg70', p: 0.20, desc: 'Clockwise rotation ~70 deg on right side, uncropped circle' },
    { label: '04_rotation_p35_deg125', p: 0.35, desc: 'Rotation arc complete ~125 deg, iris centered on right' },
    { label: '05_immersion_p50_layers', p: 0.50, desc: 'Rotation eases, iris glides to center, camera enters 11 layers' },
    { label: '06_immersion_p65_consolidating', p: 0.65, desc: 'Stroma travel continues, layers draw together to Solo plate' },
    { label: '07_transition_p80_seam', p: 0.80, desc: 'Asymmetric photographic seam sweeps behind iris, layers dissolve' },
    { label: '08_gallery_p100_settled', p: 1.00, desc: 'Gallery established, warm ivory background, Solo artwork plate settled' },
  ];

  for (const step of steps) {
    const targetY = stMetrics.start + step.p * stMetrics.totalTravel;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await new Promise((r) => setTimeout(r, 650));

    const shotPath = path.join(ARTIFACT_DIR, `${step.label}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`📸 ${step.label}.png captured (p=${step.p.toFixed(2)})`);
  }

  // Reverse scroll back to top
  console.log('🔄 Reverse scrolling to p=0.00...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 900));

  const reverseCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const heroCta = Array.from(document.querySelectorAll('a[href="/book"]')).find(a => a.innerText.includes('BOOK YOUR IRIS'));
    return {
      h1Visible: !!h1 && h1.offsetParent !== null,
      h1Opacity: h1 ? window.getComputedStyle(h1).opacity : '0',
      ctaVisible: !!heroCta && heroCta.offsetParent !== null,
      scrollY: window.scrollY,
    };
  });
  console.log('Reverse Scroll Restoration Check:', reverseCheck);

  const shotReverse = path.join(ARTIFACT_DIR, '09_reverse_scroll_restored_hero.png');
  await page.screenshot({ path: shotReverse });
  console.log('📸 09_reverse_scroll_restored_hero.png captured');

  await browser.close();
  console.log('✅ All tests completed successfully!');
}

runTest().catch(console.error);
