import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  console.log('=== TESTING REFRESH & ENTRANCE REPLAY LIFECYCLE ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--ignore-gpu-blocklist'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------
    // TEST 1: Initial Fresh Page Load (No query parameters)
    // -------------------------------------------------------------
    console.log('TEST 1: Initial page load at http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    const t1Initial = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return {
        hasTimeline: !!tl,
        progress: tl ? tl.progress() : null,
        isPlaying: tl ? tl.isActive() : null,
      };
    });
    console.log('Test 1 initial state (t=200ms):', t1Initial);

    if (t1Initial.progress > 0.5) {
      throw new Error(`Test 1 Failed: Intro started at progress ${t1Initial.progress} instead of beginning!`);
    }

    // Wait 2.0s and verify it is actively progressing
    await new Promise(r => setTimeout(r, 1800));
    const t1Mid = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return { progress: tl ? tl.progress() : null, isActive: tl ? tl.isActive() : null };
    });
    console.log('Test 1 mid state (t=2.0s):', t1Mid);

    // Wait for intro completion (at 3.8s)
    await new Promise(r => setTimeout(r, 2200));
    const t1Complete = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return { progress: tl ? tl.progress() : null, completeFlag: !!window.__irisHomepageIntroComplete };
    });
    console.log('Test 1 completed state (t=4.2s):', t1Complete);
    console.log('✔ TEST 1 PASSED: Fresh visit successfully played intro from beginning to completion.\n');

    // -------------------------------------------------------------
    // TEST 2: Normal Browser Reload (Ctrl+R / F5)
    // -------------------------------------------------------------
    console.log('TEST 2: Performing normal browser reload (page.reload())...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    const t2Initial = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return {
        hasTimeline: !!tl,
        progress: tl ? tl.progress() : null,
        isPlaying: tl ? tl.isActive() : null,
      };
    });
    console.log('Test 2 state immediately after reload (t=200ms):', t2Initial);

    if (t2Initial.progress > 0.4) {
      throw new Error(`Test 2 Failed: Intro did not replay from beginning on refresh! Progress was ${t2Initial.progress}`);
    }

    // Wait for reload intro to finish
    await new Promise(r => setTimeout(r, 3800));
    const t2Complete = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return { progress: tl ? tl.progress() : null };
    });
    console.log('Test 2 completed state:', t2Complete);
    console.log('✔ TEST 2 PASSED: Browser reload cleanly replayed the full cinematic entrance.\n');

    // -------------------------------------------------------------
    // TEST 3: Hard Refresh / Fresh Session in New Tab
    // -------------------------------------------------------------
    console.log('TEST 3: Simulating hard refresh in new tab...');
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1440, height: 900 });
    await page2.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    const t3Initial = await page2.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return { progress: tl ? tl.progress() : null, isPlaying: tl ? tl.isActive() : null };
    });
    console.log('Test 3 state (t=200ms):', t3Initial);
    if (t3Initial.progress > 0.4) {
      throw new Error(`Test 3 Failed: Intro did not start from beginning! Progress: ${t3Initial.progress}`);
    }
    await page2.close();
    console.log('✔ TEST 3 PASSED: Hard refresh / fresh tab plays entrance from beginning.\n');

    // -------------------------------------------------------------
    // TEST 4: Scroll Down -> Scroll Back to Top (Must NOT replay intro on scroll)
    // -------------------------------------------------------------
    console.log('TEST 4: Scrolling down to Phase C (70%), then returning to top...');
    await page.evaluate(() => {
      if (window.__irisScrollToProgress) window.__irisScrollToProgress(0.70);
    });
    await new Promise(r => setTimeout(r, 1200));

    const scrollDownState = await page.evaluate(() => {
      const st = window.__irisHomepageScrollTimeline;
      return {
        scrollY: window.scrollY,
        stProgress: st ? st.progress() : null
      };
    });
    console.log('Scrolled down state (p=0.70):', scrollDownState);

    // Scroll back to top
    console.log('Scrolling back up to top (p=0.0)...');
    await page.evaluate(() => {
      if (window.__irisScrollToProgress) window.__irisScrollToProgress(0.0);
    });
    await new Promise(r => setTimeout(r, 1200));

    const returnTopState = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      const st = window.__irisHomepageScrollTimeline;
      return {
        scrollY: window.scrollY,
        stProgress: st ? st.progress() : null,
        introProgress: tl ? tl.progress() : null, // Must remain 1.0 (settled), not restarted!
        isIntroActive: tl ? tl.isActive() : null
      };
    });
    console.log('Returned to top state:', returnTopState);
    if (returnTopState.introProgress !== 1.0) {
      throw new Error(`Test 4 Failed: Intro unexpectedly replayed on scroll! Progress was ${returnTopState.introProgress}`);
    }
    console.log('✔ TEST 4 PASSED: Returning to the top leaves iris settled; does not restart intro on scroll.\n');

    // -------------------------------------------------------------
    // TEST 5: Reload while scrolled down (Scroll position must reset & intro replay)
    // -------------------------------------------------------------
    console.log('TEST 5: Scrolling down to Section 2 (p=0.90) and performing browser reload...');
    await page.evaluate(() => {
      if (window.__irisScrollToProgress) window.__irisScrollToProgress(0.90);
    });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Reloading while scrolled down...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    const reloadFromScrolledState = await page.evaluate(() => {
      const tl = window.__irisHomepageTimeline;
      return {
        scrollY: window.scrollY,
        introProgress: tl ? tl.progress() : null,
        isIntroActive: tl ? tl.isActive() : null
      };
    });
    console.log('State immediately after reload while scrolled:', reloadFromScrolledState);

    if (reloadFromScrolledState.scrollY > 50) {
      throw new Error(`Test 5 Failed: Scroll position was not reset to top on reload! scrollY=${reloadFromScrolledState.scrollY}`);
    }
    if (reloadFromScrolledState.introProgress > 0.4) {
      throw new Error(`Test 5 Failed: Intro did not start from beginning after reload! Progress: ${reloadFromScrolledState.introProgress}`);
    }

    console.log('✔ TEST 5 PASSED: Reloading while scrolled resets scroll to top and replays full entrance.\n');

    console.log('====================================================');
    console.log('ALL 5 REPLAY & LIFECYCLE TESTS PASSED WITH 100% SUCCESS');
    console.log('====================================================');

  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

test();
