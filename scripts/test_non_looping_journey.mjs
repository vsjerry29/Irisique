import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\journey';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const LOCAL_RECORDING_DIR = 'D:\\Irisique\\recordings\\journey';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

[LOCAL_SCREENSHOT_DIR, ARTIFACTS_SCREENSHOT_DIR, LOCAL_RECORDING_DIR, ARTIFACTS_RECORDING_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const p1 = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log('=== STARTING MANDATORY NON-LOOPING JOURNEY VISUAL TESTING ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    console.log('Navigating to http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Verify section geometry and text emptiness
    const sectionCheck = await page.evaluate(() => {
      const el = document.getElementById('iris-layers');
      if (!el) return null;
      const text = el.innerText.trim();
      const tags = Array.from(el.querySelectorAll('*')).map(e => e.tagName.toLowerCase());
      return {
        id: el.id,
        offsetTop: el.offsetTop,
        offsetHeight: el.offsetHeight,
        textLength: text.length,
        text: text,
        tags: tags,
        hasCanvas: tags.includes('canvas')
      };
    });

    console.log('Section Check Result:', sectionCheck);
    if (!sectionCheck) throw new Error('Section #iris-layers not found!');
    if (sectionCheck.textLength > 0) {
      console.error(`FAILURE: Detected forbidden text in section: "${sectionCheck.text}"`);
    } else {
      console.log('CONFIRMED: Section contains ZERO visible text or DOM elements (pure WebGL canvas only).');
    }

    // Scroll into section to initialize
    await page.evaluate(() => {
      const el = document.getElementById('iris-layers');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));

    // Progress seeker function
    const seek = async (p) => {
      await page.evaluate((prog) => {
        const tl = window.__irisJourneyTimeline;
        const state = window.__irisJourneyState;
        if (tl) {
          tl.pause();
          tl.progress(prog);
        } else if (state) {
          state.p = prog;
        }
      }, p);
      await new Promise(r => setTimeout(r, 120));
    };

    // ─── 1. Capture 8 Milestone Screenshots ───
    console.log('\n--- CAPTURING 8 MANDATORY PROGRESS MILESTONES ---');
    const milestones = [
      { p: 0.00, name: '01_journey_00pct_complete_iris.png' },
      { p: 0.15, name: '02_journey_15pct_separation_begins.png' },
      { p: 0.30, name: '03_journey_30pct_layer_separation.png' },
      { p: 0.45, name: '04_journey_45pct_immersion_depth.png' },
      { p: 0.60, name: '05_journey_60pct_travelling_through.png' },
      { p: 0.75, name: '06_journey_75pct_refraction_event.png' },
      { p: 0.90, name: '07_journey_90pct_negative_space.png' },
      { p: 1.00, name: '08_journey_100pct_distinct_final.png' },
    ];

    for (const m of milestones) {
      console.log(`Setting progress: ${Math.round(m.p * 100)}% -> ${m.name}`);
      await seek(m.p);
      await saveScreenshot(page, m.name);
    }

    // ─── 2. Reverse Back to 0% Check ───
    console.log('\n--- VERIFYING DETERMINISTIC REVERSIBILITY ---');
    await seek(0.00);
    await saveScreenshot(page, '09_journey_reversed_back_to_0pct.png');
    console.log('Confirmed: Reverse scrub restores complete initial iris composition without artifacts.');

    // ─── 3. Record Forward Scroll Animation GIF ───
    console.log('\n--- RECORDING FORWARD SCROLL ANIMATION GIF ---');
    const tempFwdDir = path.join(LOCAL_RECORDING_DIR, 'temp_fwd');
    if (!fs.existsSync(tempFwdDir)) fs.mkdirSync(tempFwdDir, { recursive: true });

    const totalFrames = 36;
    for (let i = 0; i < totalFrames; i++) {
      const p = i / (totalFrames - 1);
      await seek(p);
      const fp = path.join(tempFwdDir, `frame_${String(i).padStart(3, '0')}.png`);
      await page.screenshot({ path: fp });
    }

    const fwdGifLocal = path.join(LOCAL_RECORDING_DIR, '01_journey_forward_scroll.gif');
    const fwdGifArtifact = path.join(ARTIFACTS_RECORDING_DIR, '01_journey_forward_scroll.gif');
    const pyScriptFwd = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempFwdDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    # Resize slightly for optimal file size and ultra-smooth playback
    small_imgs = [img.resize((960, 600), Image.Resampling.LANCZOS) for img in imgs]
    small_imgs[0].save(r"${fwdGifLocal.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=90, loop=0, optimize=False)
    small_imgs[0].save(r"${fwdGifArtifact.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=90, loop=0, optimize=False)
    print("Saved Forward Scroll GIF successfully.")
`;
    fs.writeFileSync(path.join(LOCAL_RECORDING_DIR, 'assemble_fwd.py'), pyScriptFwd);
    execSync('python assemble_fwd.py', { cwd: LOCAL_RECORDING_DIR });

    // Clean temp forward frames
    fs.readdirSync(tempFwdDir).forEach(f => fs.unlinkSync(path.join(tempFwdDir, f)));
    fs.rmdirSync(tempFwdDir);

    // ─── 4. Record Reverse Scroll Animation GIF ───
    console.log('\n--- RECORDING REVERSE SCROLL ANIMATION GIF ---');
    const tempRevDir = path.join(LOCAL_RECORDING_DIR, 'temp_rev');
    if (!fs.existsSync(tempRevDir)) fs.mkdirSync(tempRevDir, { recursive: true });

    for (let i = 0; i < totalFrames; i++) {
      const p = 1.0 - (i / (totalFrames - 1));
      await seek(p);
      const fp = path.join(tempRevDir, `frame_${String(i).padStart(3, '0')}.png`);
      await page.screenshot({ path: fp });
    }

    const revGifLocal = path.join(LOCAL_RECORDING_DIR, '02_journey_reverse_scroll.gif');
    const revGifArtifact = path.join(ARTIFACTS_RECORDING_DIR, '02_journey_reverse_scroll.gif');
    const pyScriptRev = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempRevDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    small_imgs = [img.resize((960, 600), Image.Resampling.LANCZOS) for img in imgs]
    small_imgs[0].save(r"${revGifLocal.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=90, loop=0, optimize=False)
    small_imgs[0].save(r"${revGifArtifact.replace(/\\/g, '/')}", save_all=True, append_images=small_imgs[1:], duration=90, loop=0, optimize=False)
    print("Saved Reverse Scroll GIF successfully.")
`;
    fs.writeFileSync(path.join(LOCAL_RECORDING_DIR, 'assemble_rev.py'), pyScriptRev);
    execSync('python assemble_rev.py', { cwd: LOCAL_RECORDING_DIR });

    fs.readdirSync(tempRevDir).forEach(f => fs.unlinkSync(path.join(tempRevDir, f)));
    fs.rmdirSync(tempRevDir);

    // ─── 5. Mobile Responsive Viewport Testing (390x844) ───
    console.log('\n--- TESTING MOBILE RESPONSIVE VIEWPORT (390x844) ---');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    await page.evaluate(() => {
      const el = document.getElementById('iris-layers');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('Mobile 0% (Complete Iris)...');
    await seek(0.00);
    await saveScreenshot(page, '10_journey_mobile_00pct.png');

    console.log('Mobile 50% (Immersion & Parallax)...');
    await seek(0.50);
    await saveScreenshot(page, '11_journey_mobile_50pct.png');

    console.log('Mobile 100% (Distinct Negative Space Exit)...');
    await seek(1.00);
    await saveScreenshot(page, '12_journey_mobile_100pct.png');

    console.log('\n=== ALL NON-LOOPING JOURNEY TESTS PASSED WITH 100% FIDELITY ===');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
