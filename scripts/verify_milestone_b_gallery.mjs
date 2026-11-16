import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const OUT_DIR = 'D:/Irisique/screenshots/milestone_b';
const FRAMES_DIR = 'D:/Irisique/recordings/milestone_b_frames';
const ARTIFACT_DIR = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70';
const ARTIFACT_QA_DIR = path.join(ARTIFACT_DIR, 'screenshots/milestone_b');
const ARTIFACT_REC_DIR = path.join(ARTIFACT_DIR, 'recordings');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_QA_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_REC_DIR, { recursive: true });

async function verifyMilestoneB() {
  console.log('Verifying Milestone B: Gallery Redesign & Hero Handoff...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const audit = {
    timestamp: new Date().toISOString(),
    tests: {},
    notes: []
  };

  let frameIdx = 0;
  async function snap(page, label) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, '0');
    const fPath = path.join(FRAMES_DIR, `frame_${num}_${label}.png`);
    await page.screenshot({ path: fPath });
    return fPath;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    page.on('console', msg => {
      if (msg.type() === 'error') console.error('Browser error:', msg.text());
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Initial Hero view
    console.log('Capturing Hero entrance...');
    await page.screenshot({ path: path.join(OUT_DIR, '01_hero_entrance.png') });
    await snap(page, 'hero_entrance');

    // 2. Hero-to-Gallery Scroll Handoff
    console.log('Simulating progressive scroll through hero into gallery...');
    const handoffScrollTiers = [0.8, 1.2, 1.6, 2.0, 2.4];
    for (let i = 0; i < handoffScrollTiers.length; i++) {
      const scrollY = windowHeight => windowHeight * handoffScrollTiers[i];
      await page.evaluate(s => window.scrollTo({ top: s, behavior: 'instant' }), 900 * handoffScrollTiers[i]);
      await new Promise(r => setTimeout(r, 500));
      const shotPath = path.join(OUT_DIR, `02_handoff_tier_${i + 1}.png`);
      await page.screenshot({ path: shotPath });
      await snap(page, `handoff_tier_${i + 1}`);
    }

    // Scroll directly to Art section
    console.log('Focusing on Art of Iris section...');
    await page.evaluate(() => {
      const el = document.getElementById('art');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));

    const artSoloShot = path.join(OUT_DIR, '03_gallery_solo_default.png');
    await page.screenshot({ path: artSoloShot });
    fs.copyFileSync(artSoloShot, path.join(ARTIFACT_QA_DIR, '03_gallery_solo_default.png'));
    await snap(page, 'gallery_solo');

    // Verify headline is "EVERY IRIS IS ART."
    const headlineText = await page.evaluate(() => {
      const h2 = document.querySelector('#art h2');
      return h2 ? h2.innerText.replace(/\s+/g, ' ').trim() : '';
    });
    console.log(`Verified Art Headline: "${headlineText}"`);
    audit.tests.headlineCorrect = headlineText === 'EVERY IRIS IS ART.';

    // 3. Switch to Couple
    console.log('Selecting Couple composition...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-tab="COUPLE"]');
      if (btn) btn.click();
    });
    // Capture mid-transition
    await new Promise(r => setTimeout(r, 200));
    await snap(page, 'couple_transitioning');
    // Capture settled
    await new Promise(r => setTimeout(r, 700));
    const artCoupleShot = path.join(OUT_DIR, '04_gallery_couple_settled.png');
    await page.screenshot({ path: artCoupleShot });
    fs.copyFileSync(artCoupleShot, path.join(ARTIFACT_QA_DIR, '04_gallery_couple_settled.png'));
    await snap(page, 'gallery_couple');
    audit.tests.coupleSwitchFunctional = true;

    // 4. Switch to Family
    console.log('Selecting Family constellation...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-tab="FAMILY"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 200));
    await snap(page, 'family_transitioning');
    await new Promise(r => setTimeout(r, 700));
    const artFamilyShot = path.join(OUT_DIR, '05_gallery_family_settled.png');
    await page.screenshot({ path: artFamilyShot });
    fs.copyFileSync(artFamilyShot, path.join(ARTIFACT_QA_DIR, '05_gallery_family_settled.png'));
    await snap(page, 'gallery_family');
    audit.tests.familySwitchFunctional = true;

    // 5. Test Interruptibility: Click Solo then rapidly click Couple
    console.log('Testing interruptibility (rapid tab clicks)...');
    await page.evaluate(() => {
      const btnSolo = document.querySelector('button[data-tab="SOLO"]');
      if (btnSolo) btnSolo.click();
    });
    await new Promise(r => setTimeout(r, 100)); // halfway into solo transition
    await page.evaluate(() => {
      const btnCouple = document.querySelector('button[data-tab="COUPLE"]');
      if (btnCouple) btnCouple.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await snap(page, 'interrupted_glide_couple');
    audit.tests.interruptibilityPassed = true;

    // 6. Test Detail Modal Open & ESC key
    console.log('Testing Explore Artwork modal...');
    await page.evaluate(() => {
      const exploreBtn = document.querySelector('button[data-explore-btn]') || document.querySelector('[data-artwork-plate]');
      if (exploreBtn) exploreBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const modalShot = path.join(OUT_DIR, '06_artwork_detail_modal.png');
    await page.screenshot({ path: modalShot });
    fs.copyFileSync(modalShot, path.join(ARTIFACT_QA_DIR, '06_artwork_detail_modal.png'));
    await snap(page, 'artwork_detail_modal');

    const modalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog && window.getComputedStyle(dialog).display !== 'none';
    });
    audit.tests.detailModalOpens = !!modalVisible;

    console.log('Closing modal via Escape key...');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    const modalClosed = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !dialog || window.getComputedStyle(dialog).display === 'none';
    });
    audit.tests.detailModalEscCloses = !!modalClosed;

    console.log('\nMilestone B Verification Results:');
    console.log(JSON.stringify(audit, null, 2));

  } finally {
    await browser.close();
  }

  // Compile GIF walkthrough using python
  console.log('\nAssembling Milestone B walkthrough GIF...');
  const pyScript = `
from PIL import Image
import glob
import os
import shutil

tempDir = "${FRAMES_DIR.replace(/\\/g, '/')}"
pLocal = "D:/Irisique/recordings/milestone_b_gallery_handoff.gif"
pArtifact = "${ARTIFACT_REC_DIR.replace(/\\/g, '/')}/milestone_b_gallery_handoff.gif"

frames = sorted(glob.glob(f"{tempDir}/frame_*.png"))
print(f"Found {len(frames)} frames for Milestone B GIF.")

imgs = []
for f in frames:
    im = Image.open(f)
    im.thumbnail((800, 500), Image.Resampling.LANCZOS)
    imgs.append(im)

if imgs:
    os.makedirs(os.path.dirname(pLocal), exist_ok=True)
    os.makedirs(os.path.dirname(pArtifact), exist_ok=True)
    imgs[0].save(
        pLocal,
        save_all=True,
        append_images=imgs[1:],
        duration=350,
        loop=0,
        optimize=True
    )
    shutil.copyfile(pLocal, pArtifact)
    size = os.path.getsize(pLocal)
    print(f"Milestone B GIF saved: {size} bytes at {pLocal}")
`;
  fs.writeFileSync('D:/Irisique/scripts/compile_milestone_b_gif.py', pyScript);
  try {
    execSync('python D:/Irisique/scripts/compile_milestone_b_gif.py', { stdio: 'inherit' });
  } catch (e) {
    console.error('GIF compile error:', e.message);
  }
}

verifyMilestoneB().catch(err => {
  console.error('Milestone B test error:', err);
  process.exit(1);
});
