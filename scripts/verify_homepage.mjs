import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\homepage';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\homepage';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

for (const dir of [SCREENSHOT_DIR, RECORDING_DIR, ARTIFACTS_SCREENSHOT_DIR, ARTIFACTS_RECORDING_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function run() {
  console.log('=== IRIS HOMEPAGE INTEGRATION & SCROLL EXPERIENCE VERIFICATION ===');
  console.log('Launching Headless Chrome with WebGL / Angle D3D11...');

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
    // -------------------------------------------------------------
    // PASS 1: Still Keyframe Captures
    // -------------------------------------------------------------
    console.log('\n--- PASS 1: Capturing Keyframe Still Moments ---');
    const pageStill = await browser.newPage();
    await pageStill.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageStill.goto('http://localhost:3000/?replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Jump intro to settled state
    await pageStill.evaluate(() => {
      if (window.__irisHomepageTimeline) window.__irisHomepageTimeline.progress(1.0);
    });
    await new Promise(r => setTimeout(r, 400));

    const stillMoments = [
      { p: 0.00, name: '01_homepage_hero_entrance_settled.png', desc: '01: Hero entrance settled (0% scroll, large central iris)' },
      { p: 0.35, name: '02_homepage_phase_b_immersive_zoom.png', desc: '02: Phase B Immersive zoom (35% scroll, 65 deg rotation, 1.35x zoom)' },
      { p: 0.68, name: '03_homepage_phase_c_transition.png', desc: '03: Phase C Transition (68% scroll, shifting right, next section entering)' },
      { p: 0.95, name: '04_homepage_phase_d_next_section.png', desc: '04: Phase D Next section settled (95% scroll, iris on right, editorial text on left)' },
    ];

    for (const sm of stillMoments) {
      await pageStill.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, sm.p);
      // Wait for scrub catchup and Three.js render
      await new Promise(r => setTimeout(r, 1200));
      const outPath = path.join(SCREENSHOT_DIR, sm.name);
      await pageStill.screenshot({ path: outPath });
      fs.copyFileSync(outPath, path.join(ARTIFACTS_SCREENSHOT_DIR, sm.name));
      console.log(`Saved: ${sm.desc} -> ${sm.name}`);
    }

    // Mobile Stills (390x844)
    console.log('\nCapturing Mobile 390x844 Viewport Stills...');
    const pageMobStill = await browser.newPage();
    await pageMobStill.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await pageMobStill.goto('http://localhost:3000/?replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await pageMobStill.evaluate(() => {
      if (window.__irisHomepageTimeline) window.__irisHomepageTimeline.progress(1.0);
      if (window.__irisScrollToProgress) window.__irisScrollToProgress(0.0);
    });
    await new Promise(r => setTimeout(r, 1000));

    // Mobile Hero
    const mobHeroPath = path.join(SCREENSHOT_DIR, '05_homepage_mobile_hero.png');
    await pageMobStill.screenshot({ path: mobHeroPath });
    fs.copyFileSync(mobHeroPath, path.join(ARTIFACTS_SCREENSHOT_DIR, '05_homepage_mobile_hero.png'));
    console.log(`Saved: Mobile Hero -> 05_homepage_mobile_hero.png`);

    // Mobile Next Section (scroll 90%)
    await pageMobStill.evaluate(() => {
      if (window.__irisScrollToProgress) window.__irisScrollToProgress(0.90);
    });
    await new Promise(r => setTimeout(r, 1200));
    const mobNextPath = path.join(SCREENSHOT_DIR, '06_homepage_mobile_next_section.png');
    await pageMobStill.screenshot({ path: mobNextPath });
    fs.copyFileSync(mobNextPath, path.join(ARTIFACTS_SCREENSHOT_DIR, '06_homepage_mobile_next_section.png'));
    console.log(`Saved: Mobile Next Section -> 06_homepage_mobile_next_section.png`);
    await pageMobStill.close();
    await pageStill.close();

    // -------------------------------------------------------------
    // PASS 2: Capture Animated GIF Recordings
    // -------------------------------------------------------------
    console.log('\n--- PASS 2: Capturing Animated GIF Recordings ---');
    const recPage = await browser.newPage();
    await recPage.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });

    const captureSequence = async (name, frameCount, frameAction, delayMs = 70) => {
      const framesTemp = path.join(RECORDING_DIR, `temp_${name}`);
      if (!fs.existsSync(framesTemp)) fs.mkdirSync(framesTemp, { recursive: true });

      const framePaths = [];
      for (let i = 0; i < frameCount; i++) {
        if (frameAction) await frameAction(i, frameCount);
        await new Promise(r => setTimeout(r, delayMs));
        const fPath = path.join(framesTemp, `frame_${String(i).padStart(3, '0')}.png`);
        await recPage.screenshot({ path: fPath });
        framePaths.push(fPath);
      }

      const gifOut = path.join(RECORDING_DIR, `${name}.gif`);
      const artifactGifOut = path.join(ARTIFACTS_RECORDING_DIR, `${name}.gif`);
      const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${framesTemp.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${gifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=${delayMs}, loop=0, optimize=False)
    imgs[0].save(r"${artifactGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=${delayMs}, loop=0, optimize=False)
    print("Saved GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
      fs.writeFileSync(path.join(RECORDING_DIR, 'assemble.py'), pyScript);
      execSync('python assemble.py', { cwd: RECORDING_DIR });

      for (const f of framePaths) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
      if (fs.existsSync(framesTemp)) fs.rmdirSync(framesTemp);
    };

    // 1. Complete Cinematic Opening (0.00s – 3.80s)
    console.log('1/6: Recording Complete Homepage Cinematic Entrance (36 frames)...');
    await recPage.goto('http://localhost:3000/?replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureSequence('01_homepage_cinematic_entrance', 36, async (i, total) => {
      const t = (i / (total - 1)) * 3.80;
      await recPage.evaluate((seekT) => {
        if (window.__irisHomepageTimeline) {
          window.__irisHomepageTimeline.pause();
          window.__irisHomepageTimeline.seek(seekT);
        }
      }, t);
    }, 75);

    // 2. Slow Scroll from Hero to Next Section (Phase A -> B -> C -> D)
    console.log('2/6: Recording Slow Scroll from Hero to Next Section (42 frames)...');
    await recPage.evaluate(() => {
      if (window.__irisHomepageTimeline) window.__irisHomepageTimeline.progress(1.0);
    });
    await new Promise(r => setTimeout(r, 400));
    await captureSequence('02_homepage_slow_scroll', 42, async (i, total) => {
      const p = i / (total - 1);
      await recPage.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, p);
    }, 110);

    // 3. Fast Scrolling (Fluid scrub catchup)
    console.log('3/6: Recording Fast Scrolling (25 frames)...');
    await captureSequence('03_homepage_fast_scroll', 25, async (i, total) => {
      const p = Math.min(1.0, (i / (total * 0.45)));
      await recPage.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, p);
    }, 65);

    // 4. Reverse Scrolling (Phase D 100% -> Phase A 0%)
    console.log('4/6: Recording Reverse Scrolling from 100% to 0% (36 frames)...');
    await captureSequence('04_homepage_reverse_scroll', 36, async (i, total) => {
      const p = 1.0 - (i / (total - 1));
      await recPage.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, p);
    }, 95);

    // 5. Rotation and Zoom Detail (Phase B & C focus)
    console.log('5/6: Recording Rotation and Zoom Detail (30 frames)...');
    await captureSequence('05_homepage_rotation_zoom_detail', 30, async (i, total) => {
      const p = 0.20 + (i / (total - 1)) * 0.55;
      await recPage.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, p);
    }, 90);

    await recPage.close();

    // 6. Mobile Scrolling (390x844)
    console.log('6/6: Recording Mobile Scrolling (32 frames)...');
    const mobRecPage = await browser.newPage();
    await mobRecPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true });
    await mobRecPage.goto('http://localhost:3000/?replay=1', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await mobRecPage.evaluate(() => {
      if (window.__irisHomepageTimeline) window.__irisHomepageTimeline.progress(1.0);
    });
    await new Promise(r => setTimeout(r, 400));

    const framesTempMob = path.join(RECORDING_DIR, 'temp_mobile');
    if (!fs.existsSync(framesTempMob)) fs.mkdirSync(framesTempMob, { recursive: true });
    const mobFramePaths = [];
    const totalMobFrames = 32;

    for (let i = 0; i < totalMobFrames; i++) {
      const p = i / (totalMobFrames - 1);
      await mobRecPage.evaluate((prog) => {
        if (window.__irisScrollToProgress) {
          window.__irisScrollToProgress(prog);
        }
      }, p);
      await new Promise(r => setTimeout(r, 100));
      const fPath = path.join(framesTempMob, `frame_${String(i).padStart(3, '0')}.png`);
      await mobRecPage.screenshot({ path: fPath });
      mobFramePaths.push(fPath);
    }

    const mobGifOut = path.join(RECORDING_DIR, '06_homepage_mobile_scroll.gif');
    const artifactMobGifOut = path.join(ARTIFACTS_RECORDING_DIR, '06_homepage_mobile_scroll.gif');
    const pyScriptMob = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${framesTempMob.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${mobGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=100, loop=0, optimize=False)
    imgs[0].save(r"${artifactMobGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=100, loop=0, optimize=False)
    print("Saved Mobile GIF:", r"${mobGifOut.replace(/\\/g, '/')}")
`;
    fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_mob.py'), pyScriptMob);
    execSync('python assemble_mob.py', { cwd: RECORDING_DIR });

    for (const f of mobFramePaths) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(framesTempMob)) fs.rmdirSync(framesTempMob);
    await mobRecPage.close();

    console.log('\n=== ALL HOMEPAGE VERIFICATION RECORDINGS & STILLS COMPLETED ===');

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
  }
}

run();
