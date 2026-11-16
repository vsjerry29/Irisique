import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots\\hero_scale_and_seamless_transition_qa';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runQA() {
  console.log('🚀 Starting Hero Scale, Seamless Transition & Minimal UI QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ─── TEST A: 1918x908 Primary Desktop Viewport ───
  console.log('\n--- TEST A: 1918x908 Desktop Viewport ---');
  const page = await browser.newPage();
  await page.setViewport({ width: 1918, height: 908, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4500)); // wait for intro to settle

  const metrics1918 = await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const restingX = Math.max(0.012, Math.min(0.035, (0.515 - 0.5) * aspect));
    const restingScale = 0.85;
    const irisDiameter = 0.93 * restingScale * h;
    const pupilCenterX = (0.5 + restingX / aspect) * w;
    const pupilCenterY = 0.5 * h;

    const h1 = document.querySelector('h1');
    const cta = document.querySelector('a[href="/book"]');
    const replayBtn = document.evaluate("//button[contains(., 'REPLAY')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const scrollIndicator = document.evaluate("//span[contains(., 'SCROLL TO EXPLORE')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    return {
      w,
      h,
      irisDiameterPx: irisDiameter.toFixed(1),
      irisDiameterVh: (irisDiameter / h * 100).toFixed(1) + 'vh',
      pupilCenterXPx: pupilCenterX.toFixed(1),
      pupilCenterXPercent: (pupilCenterX / w * 100).toFixed(2) + '%',
      pupilCenterYPx: pupilCenterY.toFixed(1),
      pupilCenterYPercent: (pupilCenterY / h * 100).toFixed(2) + '%',
      h1Visible: !!h1 && h1.getBoundingClientRect().height > 0,
      ctaVisible: !!cta && cta.getBoundingClientRect().height > 0,
      hasReplayBtn: !!replayBtn,
      hasScrollIndicator: !!scrollIndicator
    };
  });
  console.log('1918x908 Metrics:', metrics1918);
  await page.screenshot({ path: path.join(OUT_DIR, '01_resting_hero_1918x908.png') });

  // ─── TEST B: Complete Cinematic Scroll Sequence (Pin duration = 1.25 * 908 = 1135px) ───
  console.log('\n--- TEST B: Complete Cinematic Scroll Sequence ---');
  const totalPinScroll = Math.round(908 * 1.25);
  console.log(`Total pin scroll travel: ${totalPinScroll}px`);

  const states = [
    { p: 0.12, name: '02_iris_rotating_p12', label: '1. Smooth Iris Rotation' },
    { p: 0.38, name: '03_stroma_immersion_p38', label: '2. Microscopic Stroma Immersion' },
    { p: 0.62, name: '04_camera_entering_pupil_p62', label: '3. Camera Approaching Pupil Core' },
    { p: 0.73, name: '05_pupil_full_screen_p73', label: '4. Pupil Fills Screen in Pitch Black' },
    { p: 0.82, name: '06_gallery_immediate_reveal_p82', label: '5. Immediate Gallery Asymmetric Seam Reveal' },
    { p: 1.00, name: '07_gallery_fully_settled_p100', label: '6. Gallery Fully Settled' },
  ];

  for (const st of states) {
    const scrollY = Math.round(st.p * totalPinScroll);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, `${st.name}.png`) });
    console.log(`Captured state: ${st.label} at scrollY=${scrollY}`);
  }

  // ─── TEST C: Reverse Scroll Back to Top ───
  console.log('\n--- TEST C: Reverse Scroll Back to Top ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '08_reverse_scroll_restored_hero.png') });
  console.log('Reverse scroll captured!');

  // ─── TEST D: Gallery Tab Layout & No Overlap Verification ───
  console.log('\n--- TEST D: Gallery Tab Layout & No Overlap Verification ---');
  await page.evaluate((y) => window.scrollTo(0, y), totalPinScroll);
  await new Promise(r => setTimeout(r, 600));

  // Check Solo Layout
  const soloBoxes = await page.evaluate(() => {
    const header = document.querySelector('#art h2');
    const tabs = document.querySelector('[data-tab="SOLO"]')?.parentElement;
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const title = plate?.nextElementSibling?.querySelector('span');
    return {
      headerBottom: header?.getBoundingClientRect().bottom,
      tabsTop: tabs?.getBoundingClientRect().top,
      tabsBottom: tabs?.getBoundingClientRect().bottom,
      plateTop: plate?.getBoundingClientRect().top,
      plateBottom: plate?.getBoundingClientRect().bottom,
      titleTop: title?.getBoundingClientRect().top
    };
  });
  console.log('Solo Layout Coordinates:', soloBoxes);
  await page.screenshot({ path: path.join(OUT_DIR, '09_gallery_tab_solo.png') });

  // Click Couple Tab
  await page.click('[data-tab="COUPLE"]');
  await new Promise(r => setTimeout(r, 800));
  const coupleBoxes = await page.evaluate(() => {
    const tabs = document.querySelector('[data-tab="COUPLE"]')?.parentElement;
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const footerMeta = plate?.parentElement?.querySelector('button');
    return {
      tabsBottom: tabs?.getBoundingClientRect().bottom,
      plateTop: plate?.getBoundingClientRect().top,
      plateBottom: plate?.getBoundingClientRect().bottom,
      metaTop: footerMeta?.getBoundingClientRect().top,
      gapAbovePlate: (plate?.getBoundingClientRect().top - tabs?.getBoundingClientRect().bottom).toFixed(1) + 'px',
      gapBelowPlate: (footerMeta?.getBoundingClientRect().top - plate?.getBoundingClientRect().bottom).toFixed(1) + 'px'
    };
  });
  console.log('Couple Layout Coordinates & Gaps:', coupleBoxes);
  await page.screenshot({ path: path.join(OUT_DIR, '10_gallery_tab_couple_no_overlap.png') });

  // Click Family Tab
  await page.click('[data-tab="FAMILY"]');
  await new Promise(r => setTimeout(r, 800));
  const familyBoxes = await page.evaluate(() => {
    const tabs = document.querySelector('[data-tab="FAMILY"]')?.parentElement;
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const footerMeta = plate?.parentElement?.querySelector('button');
    return {
      gapAbovePlate: (plate?.getBoundingClientRect().top - tabs?.getBoundingClientRect().bottom).toFixed(1) + 'px',
      gapBelowPlate: (footerMeta?.getBoundingClientRect().top - plate?.getBoundingClientRect().bottom).toFixed(1) + 'px'
    };
  });
  console.log('Family Layout Gaps:', familyBoxes);
  await page.screenshot({ path: path.join(OUT_DIR, '11_gallery_tab_family_no_overlap.png') });

  // ─── TEST E: Multi-Resolution Responsive Resting Hero ───
  console.log('\n--- TEST E: Multi-Resolution Responsive Resting Hero ---');
  const resolutions = [
    { w: 1758, h: 830, name: '1758x830' },
    { w: 1440, h: 900, name: '1440x900' },
    { w: 390, h: 844, name: '390x844_mobile' },
  ];

  for (const res of resolutions) {
    const pRes = await browser.newPage();
    await pRes.setViewport({ width: res.w, height: res.h, deviceScaleFactor: 1 });
    await pRes.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4500));
    await pRes.screenshot({ path: path.join(OUT_DIR, `resting_hero_${res.name}.png`) });
    console.log(`Captured resting hero for ${res.name}`);
    await pRes.close();
  }

  await browser.close();
  console.log('✅ QA Complete! All screenshots saved to:', OUT_DIR);
}

runQA().catch(err => {
  console.error('Error during QA:', err);
  process.exit(1);
});
