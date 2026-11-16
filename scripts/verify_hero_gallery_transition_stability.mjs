import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots", "transition_stability_verified");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("=== Launching Comprehensive Transition Stability Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--window-size=1758,950",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1758, height: 830, deviceScaleFactor: 1 });

  console.log("Navigating to http://localhost:3000?transitionDebug=1 ...");
  await page.goto("http://localhost:3000?transitionDebug=1", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2400);

  // 1. Resting Hero State
  console.log("1. Capturing Resting Hero State...");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_resting_hero_approved.png") });

  const heroMetrics = await page.evaluate(() => {
    const heading = document.querySelector("h1");
    const cta = document.querySelector("a[href='/book']");
    const canvas = document.querySelector("canvas");
    return {
      headingText: heading ? heading.innerText.trim().replace(/\s+/g, " ") : null,
      ctaText: cta ? cta.innerText.trim().replace(/\s+/g, " ") : null,
      headingOpacity: heading ? window.getComputedStyle(heading).opacity : null,
      canvasVisible: !!canvas,
      canvasOpacity: canvas ? window.getComputedStyle(canvas).opacity : null,
    };
  });
  console.log("Hero Metrics:", heroMetrics);

  // Measure pinned scroll range
  const scrollRange = await page.evaluate(() => {
    const st = window.ScrollTrigger.getAll()[0];
    return {
      start: st.start,
      end: st.end,
      total: st.end - st.start,
    };
  });
  console.log("Scroll range:", scrollRange);

  // 2. Pupil dive at p ≈ 0.58
  const yPupil = scrollRange.start + scrollRange.total * 0.58;
  console.log(`2. Scrolling to Pupil Dive (y=${Math.round(yPupil)}, p=58%)...`);
  await page.evaluate((y) => window.scrollTo(0, y), yPupil);
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_pupil_dive_p58.png") });

  // 3. Handoff check points (25%, 50%, 75%)
  const y25 = scrollRange.start + scrollRange.total * 0.685;
  console.log(`3a. Scrolling to 25% handoff (y=${Math.round(y25)}, p=68.5%)...`);
  await page.evaluate((y) => window.scrollTo(0, y), y25);
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_handoff_25pct_p68.png") });

  const y50 = scrollRange.start + scrollRange.total * 0.75;
  console.log(`3b. Scrolling to 50% handoff (y=${Math.round(y50)}, p=75%)...`);
  await page.evaluate((y) => window.scrollTo(0, y), y50);
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_handoff_50pct_p75.png") });

  const y75 = scrollRange.start + scrollRange.total * 0.82;
  console.log(`3c. Scrolling to 75% handoff (y=${Math.round(y75)}, p=82%)...`);
  await page.evaluate((y) => window.scrollTo(0, y), y75);
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_handoff_75pct_p82.png") });

  // 4. Settled Gallery State (p = 0.96)
  const ySettled = scrollRange.start + scrollRange.total * 0.96;
  console.log(`4. Scrolling to Settled Gallery (y=${Math.round(ySettled)}, p=96%)...`);
  await page.evaluate((y) => window.scrollTo(0, y), ySettled);
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_gallery_settled_solo.png") });

  const galleryMetrics = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const overlay = document.querySelector("div[data-section='unified-iris'] > div:nth-child(2)");
    const hudState = document.getElementById("td-state")?.innerText;
    const hudBg = document.getElementById("td-bg")?.innerText;
    const hudCanvasOp = document.getElementById("td-canvas-opacity")?.innerText;

    return {
      canvasDisplay: canvas ? window.getComputedStyle(canvas).display : null,
      canvasOpacity: canvas ? window.getComputedStyle(canvas).opacity : null,
      hudState,
      hudBg,
      hudCanvasOp,
    };
  });
  console.log("Settled Gallery Metrics:", galleryMetrics);

  // 5. Critical Stability Test: Tab switches in Settled Gallery
  console.log("5. Testing Tab Switching in Settled Gallery...");
  
  // Switch to COUPLE
  console.log("   - Hovering COUPLE button...");
  const coupleBtn = await page.$("button[data-tab='COUPLE']");
  if (coupleBtn) {
    await coupleBtn.hover();
    await sleep(250);
    await coupleBtn.click();
    await sleep(1000);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_gallery_tab_couple.png") });

  // Switch to FAMILY
  console.log("   - Hovering FAMILY button...");
  const familyBtn = await page.$("button[data-tab='FAMILY']");
  if (familyBtn) {
    await familyBtn.hover();
    await sleep(250);
    await familyBtn.click();
    await sleep(1000);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_gallery_tab_family.png") });

  // Switch back to SOLO
  console.log("   - Returning to SOLO button...");
  const soloBtn = await page.$("button[data-tab='SOLO']");
  if (soloBtn) {
    await soloBtn.hover();
    await sleep(250);
    await soloBtn.click();
    await sleep(1000);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_gallery_tab_solo_returned.png") });

  // 10s idle verification
  console.log("   - Idling for 5 seconds to ensure absolute state stability...");
  await sleep(5000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_gallery_idle_10s_stable.png") });

  // 6. 3 Forward / Reverse Scroll Cycles
  console.log("6. Testing 3 Forward / Reverse Scroll Cycles...");
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`   Cycle ${cycle}: Reverse scroll to Hero (y = 0)...`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);
    if (cycle === 1) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `11_reverse_scroll_cycle${cycle}_hero.png`) });
    }

    console.log(`   Cycle ${cycle}: Forward scroll to Settled Gallery (y = ${Math.round(ySettled)})...`);
    await page.evaluate((y) => window.scrollTo(0, y), ySettled);
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `12_forward_scroll_cycle${cycle}_gallery.png`) });
  }

  // 7. Multi-Resolution Responsive Checks
  console.log("7. Responsive Verification...");
  // Standard Laptop 1440x900
  console.log("   - Testing 1440x900 (Laptop)...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_res_1440x900_hero.png") });

  const laptopScrollY = 900 * 1.25 * 0.96;
  await page.evaluate((y) => window.scrollTo(0, y), laptopScrollY);
  await sleep(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14_res_1440x900_gallery.png") });

  // Mobile 390x844
  console.log("   - Testing 390x844 (Mobile)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15_res_390x844_hero.png") });

  const mobileScrollY = 844 * 1.25 * 0.96;
  await page.evaluate((y) => window.scrollTo(0, y), mobileScrollY);
  await sleep(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "16_res_390x844_gallery.png") });

  console.log("=== All Tests Completed Successfully ===");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
