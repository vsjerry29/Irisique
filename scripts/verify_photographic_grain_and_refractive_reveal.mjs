import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots", "cinematic_transition_rebuild");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("=== Launching Chrome Puppeteer Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for intro animation to complete
  await sleep(2200);

  // 1. Resting Hero Check
  console.log("1. Capturing Resting Hero State...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01_resting_hero_approved.png"),
  });

  // Verify hero headline and button exist
  const heroElements = await page.evaluate(() => {
    const heading = document.querySelector("h1");
    const bookBtn = document.querySelector("a[href='/book']");
    return {
      headingText: heading ? heading.innerText.trim() : null,
      bookBtnText: bookBtn ? bookBtn.innerText.trim() : null,
    };
  });
  console.log("Hero Elements:", heroElements);

  // 2. Scroll through Pin Sequence
  const totalPinHeight = await page.evaluate(() => window.innerHeight * 1.25);
  console.log(`Pin scroll travel: ${totalPinHeight}px`);

  // Checkpoint A: Iris Rotation (p = 0.15)
  console.log("2. Checkpoint A: Iris Clockwise Rotation (p ~ 0.15)...");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(totalPinHeight * 0.15));
  await sleep(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02_iris_rotating_clockwise.png"),
  });

  // Checkpoint B: Stroma Immersion (p = 0.45)
  console.log("3. Checkpoint B: Stroma 3D Immersion (p ~ 0.45)...");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(totalPinHeight * 0.45));
  await sleep(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03_stroma_depth_immersion.png"),
  });

  // Checkpoint C: Camera Entering Pupil (p = 0.68)
  console.log("4. Checkpoint C: Camera Entering Darkroom Pupil (p ~ 0.68)...");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(totalPinHeight * 0.68));
  await sleep(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "04_camera_entering_pupil.png"),
  });

  // Checkpoint D: Photographic Grain Development & Solo Materialization (p = 0.82)
  console.log("5. Checkpoint D: Photographic Grain Development (p ~ 0.82)...");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(totalPinHeight * 0.82));
  await sleep(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "05_photographic_grain_development.png"),
  });

  // Checkpoint E: Settled Gallery Stage (p = 1.00)
  console.log("6. Checkpoint E: Fully Settled Warm-Ivory Gallery (p = 1.00)...");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(totalPinHeight * 1.00));
  await sleep(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "06_gallery_settled_solo_stage.png"),
  });

  // 3. Inspect Stage Geometry in Solo State
  const stageInfo = await page.evaluate(() => {
    const stage = document.querySelector("[data-artwork-plate='true']");
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    const style = window.getComputedStyle(stage);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      aspectRatio: (rect.width / rect.height).toFixed(3),
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      viewportHeight: window.innerHeight,
      bottomWithinViewport: rect.bottom <= window.innerHeight,
    };
  });
  console.log("Stage Geometry (Solo):", stageInfo);

  // 4. Test Hover Transitions (Refractive Fibre Reveal)
  console.log("7. Testing Refractive Fibre Reveal: Hovering over COUPLE tab...");
  const coupleBtn = await page.$("button[data-composition='couple']");
  if (coupleBtn) {
    await coupleBtn.hover();
    await sleep(250); // Mid-transition snapshot showing Refractive Fibre Reveal
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07_refractive_reveal_to_couple_mid.png"),
    });

    await sleep(400); // Settled couple state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08_couple_settled_16x9_stage.png"),
    });
  }

  console.log("8. Testing Refractive Fibre Reveal: Hovering over FAMILY tab...");
  const familyBtn = await page.$("button[data-composition='family']");
  if (familyBtn) {
    await familyBtn.hover();
    await sleep(250); // Mid-transition snapshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09a_refractive_reveal_to_family_mid.png"),
    });

    await sleep(400); // Settled family state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09b_family_settled_16x9_stage.png"),
    });
  }

  // 5. Test Fullscreen Artwork Modal
  console.log("9. Testing Fullscreen Artwork Modal...");
  const exploreBtn = await page.$("button[data-explore-btn='true']");
  if (exploreBtn) {
    await exploreBtn.click();
    await sleep(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10_artwork_detail_modal.png"),
    });

    // Close modal via Escape key
    await page.keyboard.press("Escape");
    await sleep(400);
  }

  // 6. Test Reverse Scroll Restoration
  console.log("10. Testing Reverse Scroll Back to Hero (p = 0.0)...");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(700);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "11_reverse_scroll_restored_hero.png"),
  });

  // 7. Multi-resolution Responsive Checks
  const resolutions = [
    { name: "1758x830_desktop", width: 1758, height: 830 },
    { name: "1440x900_laptop", width: 1440, height: 900 },
    { name: "390x844_mobile", width: 390, height: 844 },
  ];

  for (const res of resolutions) {
    console.log(`Checking resolution ${res.name} (${res.width}x${res.height})...`);
    await page.setViewport({ width: res.width, height: res.height, deviceScaleFactor: 1 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `res_hero_${res.name}.png`),
    });

    // Check gallery settled at this resolution
    const pinH = await page.evaluate(() => window.innerHeight * 1.25);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(pinH));
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `res_gallery_${res.name}.png`),
    });
  }

  await browser.close();
  console.log("=== Verification Completed Successfully ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
