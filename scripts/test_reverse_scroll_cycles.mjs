import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'D:\\Irisique\\screenshots\\homepage';
const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\screenshots';
const RECORDING_DIR = 'D:\\Irisique\\recordings\\homepage';
const ARTIFACTS_RECORDING_DIR = 'C:\\Users\\SuriyaVS\\.gemini\\antigravity\\brain\\58b64365-08e0-4343-af70-8254ddcc9d70\\recordings';

[SCREENSHOT_DIR, ARTIFACTS_SCREENSHOT_DIR, RECORDING_DIR, ARTIFACTS_RECORDING_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function getHeroTextStatus(page) {
  return await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = document.querySelector('h1')?.nextElementSibling;
    const cta = document.querySelector('a[href="#explore"]');
    const heroContainer = h1?.closest('[class*="pointer-events"]');

    function getElementInfo(el) {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        text: el.innerText.trim().replace(/\s+/g, ' '),
        opacity: parseFloat(style.opacity),
        visibility: style.visibility,
        display: style.display,
        pointerEvents: style.pointerEvents,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }

    // Also check scroll wrapper & intro wrapper
    let parent1 = h1?.parentElement;
    let parent2 = parent1?.parentElement;
    let parent3 = parent2?.parentElement;
    let parent4 = parent3?.parentElement;

    return {
      scrollY: window.scrollY,
      h1: getElementInfo(h1),
      p: getElementInfo(p),
      cta: getElementInfo(cta),
      wrapperOpacity: parent3 ? parseFloat(window.getComputedStyle(parent3).opacity) : null,
      outerOpacity: parent4 ? parseFloat(window.getComputedStyle(parent4).opacity) : null,
      scrollProgress: window.__irisHomepageScrollTimeline?.scrollTrigger?.progress ?? null,
    };
  });
}

async function testReverseScrollCycles() {
  console.log('=== STARTING REVERSE SCROLL CYCLE VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  // 1. Initial Load & Entrance Playback
  console.log('\n[Phase 1] Loading homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Wait for 4.0s so full entrance plays cleanly to completion
  console.log('Waiting 4.2s for cinematic entrance to complete...');
  await new Promise(r => setTimeout(r, 4200));

  const initialStatus = await getHeroTextStatus(page);
  console.log('Initial Settled Top Status:');
  console.log(`- Headline "${initialStatus.h1?.text}" opacity: ${initialStatus.h1?.opacity}, visibility: ${initialStatus.h1?.visibility}`);
  console.log(`- Description "${initialStatus.p?.text?.substring(0, 30)}..." opacity: ${initialStatus.p?.opacity}`);
  console.log(`- CTA "${initialStatus.cta?.text}" opacity: ${initialStatus.cta?.opacity}`);
  await saveScreenshot(page, '01_hero_initial_settled_top.png');

  if (initialStatus.h1?.opacity < 0.9) {
    throw new Error('Initial entrance failed to reveal hero heading!');
  }

  // Find scroll target for Section 2
  const scrollTarget = await page.evaluate(() => {
    const st = window.__irisHomepageScrollTimeline?.scrollTrigger;
    if (st) {
      return st.start + (st.end - st.start) * 0.75;
    }
    return 1500;
  });

  const cycleResults = [];

  // GIF Recording frames
  const tempGifDir = path.join(RECORDING_DIR, 'temp_reverse_scroll');
  if (!fs.existsSync(tempGifDir)) fs.mkdirSync(tempGifDir, { recursive: true });
  let gifFrameIdx = 0;

  // Perform 3 Cycles of Down -> Up
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`\n--- CYCLE ${cycle} OF 3 ---`);

    // A. Smooth scroll down to Section 2 (progress ~0.75)
    console.log(`[Cycle ${cycle}] Scrolling down to scrollY = ${Math.round(scrollTarget)}...`);
    const stepsDown = 15;
    for (let s = 1; s <= stepsDown; s++) {
      const y = (s / stepsDown) * scrollTarget;
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise(r => setTimeout(r, 40));

      if (cycle === 1) {
        const fp = path.join(tempGifDir, `frame_${String(gifFrameIdx++).padStart(3, '0')}.png`);
        await page.screenshot({ path: fp });
      }
    }
    await new Promise(r => setTimeout(r, 300));

    const downStatus = await getHeroTextStatus(page);
    console.log(`[Cycle ${cycle}] Scrolled Down Status:`);
    console.log(`- Headline opacity: ${downStatus.h1?.opacity}, visibility: ${downStatus.h1?.visibility}`);
    console.log(`- CTA opacity: ${downStatus.cta?.opacity}`);
    console.log(`- Scroll progress: ${downStatus.scrollProgress?.toFixed(2)}`);

    if (cycle === 1) {
      await saveScreenshot(page, 'cycle1_scrolled_down_section2.png');
    }

    // B. Smooth scroll back UP to top (scrollY = 0)
    console.log(`[Cycle ${cycle}] Scrolling back UP to top (scrollY = 0)...`);
    const stepsUp = 15;
    for (let s = 1; s <= stepsUp; s++) {
      const y = (1 - s / stepsUp) * scrollTarget;
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise(r => setTimeout(r, 40));

      if (cycle === 1) {
        const fp = path.join(tempGifDir, `frame_${String(gifFrameIdx++).padStart(3, '0')}.png`);
        await page.screenshot({ path: fp });
      }
    }

    // Wait for GSAP scrub to catch up cleanly
    await new Promise(r => setTimeout(r, 600));

    if (cycle === 1) {
      // Hold a few frames at top in recording
      for (let h = 0; h < 4; h++) {
        const fp = path.join(tempGifDir, `frame_${String(gifFrameIdx++).padStart(3, '0')}.png`);
        await page.screenshot({ path: fp });
        await new Promise(r => setTimeout(r, 50));
      }
    }

    const upStatus = await getHeroTextStatus(page);
    console.log(`[Cycle ${cycle}] Returned to Top Status:`);
    console.log(`- Headline "${upStatus.h1?.text}" opacity: ${upStatus.h1?.opacity}, visibility: ${upStatus.h1?.visibility}`);
    console.log(`- Description opacity: ${upStatus.p?.opacity}`);
    console.log(`- CTA "${upStatus.cta?.text}" opacity: ${upStatus.cta?.opacity}, pointerEvents: ${upStatus.cta?.pointerEvents}`);
    console.log(`- Scroll progress: ${upStatus.scrollProgress}`);

    const screenshotName = `0${cycle + 1}_hero_top_cycle_${cycle}.png`;
    await saveScreenshot(page, screenshotName);

    cycleResults.push({
      cycle,
      headlineOpacity: upStatus.h1?.opacity,
      descriptionOpacity: upStatus.p?.opacity,
      ctaOpacity: upStatus.cta?.opacity,
      ctaText: upStatus.cta?.text,
      visibility: upStatus.h1?.visibility,
    });
  }

  // Assemble GIF
  const gifOut = path.join(RECORDING_DIR, '08_homepage_reverse_scroll_text_return.gif');
  const artifactGifOut = path.join(ARTIFACTS_RECORDING_DIR, '08_homepage_reverse_scroll_text_return.gif');
  const pyScript = `
from PIL import Image
import glob
frames = sorted(glob.glob(r"${tempGifDir.replace(/\\/g, '/')}/frame_*.png"))
imgs = [Image.open(f) for f in frames]
if imgs:
    imgs[0].save(r"${gifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=60, loop=0, optimize=False)
    imgs[0].save(r"${artifactGifOut.replace(/\\/g, '/')}", save_all=True, append_images=imgs[1:], duration=60, loop=0, optimize=False)
    print("Saved Reverse Scroll GIF:", r"${gifOut.replace(/\\/g, '/')}")
`;
  fs.writeFileSync(path.join(RECORDING_DIR, 'assemble_reverse.py'), pyScript);
  execSync('python assemble_reverse.py', { cwd: RECORDING_DIR });

  // Clean temp frames
  const fList = fs.readdirSync(tempGifDir);
  for (const f of fList) fs.unlinkSync(path.join(tempGifDir, f));
  fs.rmdirSync(tempGifDir);

  // 4. Test Browser Refresh to ensure entrance still plays
  console.log('\n--- VERIFYING BROWSER REFRESH AFTER CYCLES ---');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const refreshEarlyStatus = await page.evaluate(() => {
    return {
      scrollY: window.scrollY,
      introProgress: window.__irisHomepageTimeline?.progress() ?? null,
      zoom: window.__irisSceneUniforms?.uIntroZoom?.value ?? null,
      heroOpacity: parseFloat(window.getComputedStyle(document.querySelector('h1') || document.body).opacity),
    };
  });
  console.log('Early Refresh State (macro entrance active):', refreshEarlyStatus);
  await saveScreenshot(page, '05_refresh_entrance_macro.png');

  console.log('Waiting for entrance after refresh to finish (3.8s)...');
  await new Promise(r => setTimeout(r, 3800));

  const refreshFinalStatus = await getHeroTextStatus(page);
  console.log('Post-Refresh Final Settled State:');
  console.log(`- Headline "${refreshFinalStatus.h1?.text}" opacity: ${refreshFinalStatus.h1?.opacity}`);
  console.log(`- CTA "${refreshFinalStatus.cta?.text}" opacity: ${refreshFinalStatus.cta?.opacity}`);
  await saveScreenshot(page, '06_refresh_entrance_settled.png');

  await browser.close();

  console.log('\n=== SUMMARY OF ALL 3 REVERSE SCROLL CYCLES ===');
  let allPassed = true;
  for (const r of cycleResults) {
    const passed = r.headlineOpacity >= 0.95 && r.descriptionOpacity >= 0.95 && r.ctaOpacity >= 0.95;
    console.log(`Cycle ${r.cycle}: Headline Opacity = ${r.headlineOpacity}, CTA Opacity = ${r.ctaOpacity} -> ${passed ? 'PASSED' : 'FAILED'}`);
    if (!passed) allPassed = false;
  }

  const refreshPassed = refreshFinalStatus.h1?.opacity >= 0.95 && refreshFinalStatus.cta?.opacity >= 0.95;
  console.log(`Refresh Playback: Headline Opacity = ${refreshFinalStatus.h1?.opacity} -> ${refreshPassed ? 'PASSED' : 'FAILED'}`);

  if (allPassed && refreshPassed) {
    console.log('\n>>> ALL 3 CYCLES + REFRESH PASSED WITH 100% SUCCESS! <<<');
  } else {
    throw new Error('One or more cycles failed!');
  }
}

testReverseScrollCycles().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
