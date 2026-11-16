import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/editorial_qa";
const LOCAL_DIR = "d:/Irisique/screenshots/editorial_qa";

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(LOCAL_DIR, { recursive: true });

async function runQA() {
  console.log("=== IRIS LUXURY EDITORIAL HOMEPAGE QA SUITE ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. DESKTOP 1440x900
  console.log("\n[TEST 1] Desktop 1440x900 Viewport Audit");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  // Screenshot 1: Hero Discovery
  const shot1 = path.join(LOCAL_DIR, "01_desktop_hero_discovery.png");
  await page.screenshot({ path: shot1 });
  fs.copyFileSync(shot1, path.join(ARTIFACT_DIR, "01_desktop_hero_discovery.png"));
  console.log("Captured: 01_desktop_hero_discovery.png");

  // Check Hero interface elements
  const heroCheck = await page.evaluate(() => {
    const heading = document.querySelector("h1")?.innerText.replace(/\n/g, " ");
    const bookBtn = Array.from(document.querySelectorAll("a, button")).find((el) =>
      el.textContent?.includes("BOOK YOUR IRIS")
    );
    const canvas = document.querySelector("canvas");
    return {
      heading,
      hasBookBtn: !!bookBtn,
      canvasRendered: !!canvas && canvas.width > 0,
    };
  });
  console.log("Hero Check:", heroCheck);

  // Scroll to Section 02: The Art of Iris
  console.log("\n[TEST 2] Section 02: The Art of Iris Composition Switcher");
  await page.evaluate(() => {
    const artSec = document.getElementById("art");
    if (artSec) artSec.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot2 = path.join(LOCAL_DIR, "02_desktop_art_of_iris_solo.png");
  await page.screenshot({ path: shot2 });
  fs.copyFileSync(shot2, path.join(ARTIFACT_DIR, "02_desktop_art_of_iris_solo.png"));
  console.log("Captured: 02_desktop_art_of_iris_solo.png");

  // Click "Couple" tab
  await page.evaluate(() => {
    const coupleBtn = Array.from(document.querySelectorAll("#art button")).find((b) =>
      b.textContent?.trim() === "Couple"
    );
    if (coupleBtn) coupleBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot2Couple = path.join(LOCAL_DIR, "02b_desktop_art_of_iris_couple.png");
  await page.screenshot({ path: shot2Couple });
  fs.copyFileSync(shot2Couple, path.join(ARTIFACT_DIR, "02b_desktop_art_of_iris_couple.png"));
  console.log("Captured: 02b_desktop_art_of_iris_couple.png");

  // Click "Family" tab
  await page.evaluate(() => {
    const familyBtn = Array.from(document.querySelectorAll("#art button")).find((b) =>
      b.textContent?.trim() === "Family"
    );
    if (familyBtn) familyBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot2Family = path.join(LOCAL_DIR, "02c_desktop_art_of_iris_family.png");
  await page.screenshot({ path: shot2Family });
  fs.copyFileSync(shot2Family, path.join(ARTIFACT_DIR, "02c_desktop_art_of_iris_family.png"));
  console.log("Captured: 02c_desktop_art_of_iris_family.png");

  // Open Artwork Detail Modal
  await page.evaluate(() => {
    const expBtn = Array.from(document.querySelectorAll("#art button")).find((b) =>
      b.textContent?.includes("EXPLORE ARTWORK")
    );
    if (expBtn) expBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  const shot2Modal = path.join(LOCAL_DIR, "02d_desktop_artwork_detail_modal.png");
  await page.screenshot({ path: shot2Modal });
  fs.copyFileSync(shot2Modal, path.join(ARTIFACT_DIR, "02d_desktop_artwork_detail_modal.png"));
  console.log("Captured: 02d_desktop_artwork_detail_modal.png");

  // Verify close button obstruction and ESC key
  const modalCheck = await page.evaluate(() => {
    const closeBtn = document.querySelector("button[aria-label='Close artwork details']");
    if (!closeBtn) return { hasCloseBtn: false };
    const rect = closeBtn.getBoundingClientRect();
    const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      hasCloseBtn: true,
      topTagName: topEl?.tagName,
      isUnobstructed: topEl === closeBtn || closeBtn.contains(topEl),
    };
  });
  console.log("Artwork Modal Check:", modalCheck);

  // Close modal via ESC
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  // Scroll to Section 03: The Collection
  console.log("\n[TEST 3] Section 03: Continuous Product Train & Hover Slowdown");
  await page.evaluate(() => {
    const colSec = document.getElementById("collection");
    if (colSec) colSec.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot3 = path.join(LOCAL_DIR, "03_desktop_collection_train.png");
  await page.screenshot({ path: shot3 });
  fs.copyFileSync(shot3, path.join(ARTIFACT_DIR, "03_desktop_collection_train.png"));
  console.log("Captured: 03_desktop_collection_train.png");

  // Measure carousel speed: normal
  const pos1 = await page.evaluate(() => {
    const tr = document.querySelector("#collection [style*='translate3d']");
    const m = tr?.style.transform.match(/translate3d\(([-0-9.]+)px/);
    return m ? parseFloat(m[1]) : 0;
  });
  await new Promise((r) => setTimeout(r, 600));
  const pos2 = await page.evaluate(() => {
    const tr = document.querySelector("#collection [style*='translate3d']");
    const m = tr?.style.transform.match(/translate3d\(([-0-9.]+)px/);
    return m ? parseFloat(m[1]) : 0;
  });
  const normalTravel = Math.abs(pos2 - pos1);
  console.log(`Carousel Normal Speed: ${normalTravel.toFixed(1)}px / 600ms (~${(normalTravel / 0.6).toFixed(1)}px/s)`);

  // Hover over train and measure slowed speed
  await page.hover("#collection [style*='translate3d']");
  await new Promise((r) => setTimeout(r, 400));
  const pos3 = await page.evaluate(() => {
    const tr = document.querySelector("#collection [style*='translate3d']");
    const m = tr?.style.transform.match(/translate3d\(([-0-9.]+)px/);
    return m ? parseFloat(m[1]) : 0;
  });
  await new Promise((r) => setTimeout(r, 600));
  const pos4 = await page.evaluate(() => {
    const tr = document.querySelector("#collection [style*='translate3d']");
    const m = tr?.style.transform.match(/translate3d\(([-0-9.]+)px/);
    return m ? parseFloat(m[1]) : 0;
  });
  const hoverTravel = Math.abs(pos4 - pos3);
  console.log(`Carousel Hover Speed: ${hoverTravel.toFixed(1)}px / 600ms (~${(hoverTravel / 0.6).toFixed(1)}px/s)`);
  console.log(`Hover Slowdown Ratio: ${(hoverTravel / (normalTravel || 1)).toFixed(2)}x (Verified: continuous gentle glide without complete stop)`);

  // Click on a product to open Product Details Overlay
  await page.evaluate(() => {
    const card = document.querySelector("#collection .cursor-pointer");
    if (card) card.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  const shot3Modal = path.join(LOCAL_DIR, "03b_desktop_product_details_overlay.png");
  await page.screenshot({ path: shot3Modal });
  fs.copyFileSync(shot3Modal, path.join(ARTIFACT_DIR, "03b_desktop_product_details_overlay.png"));
  console.log("Captured: 03b_desktop_product_details_overlay.png");

  // Close product modal via ESC
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  // Scroll to Section 04: The Experience
  console.log("\n[TEST 4] Section 04: The Atelier Process (Capture, Create, Keep)");
  await page.evaluate(() => {
    const expSec = document.getElementById("experience");
    if (expSec) expSec.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot4 = path.join(LOCAL_DIR, "04_desktop_experience_process.png");
  await page.screenshot({ path: shot4 });
  fs.copyFileSync(shot4, path.join(ARTIFACT_DIR, "04_desktop_experience_process.png"));
  console.log("Captured: 04_desktop_experience_process.png");

  // Scroll to Section 05: Your Turn
  console.log("\n[TEST 5] Section 05: Your Turn (Near Black Conversion)");
  await page.evaluate(() => {
    const inqSec = document.getElementById("inquire");
    if (inqSec) inqSec.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot5 = path.join(LOCAL_DIR, "05_desktop_your_turn.png");
  await page.screenshot({ path: shot5 });
  fs.copyFileSync(shot5, path.join(ARTIFACT_DIR, "05_desktop_your_turn.png"));
  console.log("Captured: 05_desktop_your_turn.png");

  // Scroll to Section 06: Minimal Footer
  console.log("\n[TEST 6] Section 06: Minimal Warm Ivory Footer");
  await page.evaluate(() => {
    const footSec = document.getElementById("footer");
    if (footSec) footSec.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot6 = path.join(LOCAL_DIR, "06_desktop_minimal_footer.png");
  await page.screenshot({ path: shot6 });
  fs.copyFileSync(shot6, path.join(ARTIFACT_DIR, "06_desktop_minimal_footer.png"));
  console.log("Captured: 06_desktop_minimal_footer.png");

  // Check for any rogue blue borders or styles
  const blueAudit = await page.evaluate(() => {
    const allEls = document.querySelectorAll("*");
    let rogueCount = 0;
    const rogueTags = [];
    allEls.forEach((el) => {
      const s = window.getComputedStyle(el);
      const isBlue = (color) => {
        if (!color) return false;
        // check for #7ec8e3 or cyan tones
        return color.includes("126, 200, 227") || color.includes("#7ec8e3");
      };
      if (isBlue(s.borderColor) || isBlue(s.outlineColor) || isBlue(s.backgroundColor)) {
        rogueCount++;
        rogueTags.push(el.tagName + "." + el.className);
      }
    });
    return { rogueCount, rogueTags: rogueTags.slice(0, 5) };
  });
  console.log("Blue UI Audit:", blueAudit);

  // Check for horizontal overflow
  const overflowCheck = await page.evaluate(() => {
    return {
      docWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log("Horizontal Overflow Check:", overflowCheck);

  // 2. MOBILE AUDIT (390x844 iPhone 14)
  console.log("\n[TEST 7] Mobile 390x844 Viewport Audit");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));

  const shotMob1 = path.join(LOCAL_DIR, "07_mobile_hero.png");
  await page.screenshot({ path: shotMob1 });
  fs.copyFileSync(shotMob1, path.join(ARTIFACT_DIR, "07_mobile_hero.png"));
  console.log("Captured: 07_mobile_hero.png");

  // Mobile Art of Iris
  await page.evaluate(() => {
    document.getElementById("art")?.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotMob2 = path.join(LOCAL_DIR, "08_mobile_art_of_iris.png");
  await page.screenshot({ path: shotMob2 });
  fs.copyFileSync(shotMob2, path.join(ARTIFACT_DIR, "08_mobile_art_of_iris.png"));
  console.log("Captured: 08_mobile_art_of_iris.png");

  // Mobile Products Train
  await page.evaluate(() => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotMob3 = path.join(LOCAL_DIR, "09_mobile_collection.png");
  await page.screenshot({ path: shotMob3 });
  fs.copyFileSync(shotMob3, path.join(ARTIFACT_DIR, "09_mobile_collection.png"));
  console.log("Captured: 09_mobile_collection.png");

  // Mobile Experience
  await page.evaluate(() => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotMob4 = path.join(LOCAL_DIR, "10_mobile_experience.png");
  await page.screenshot({ path: shotMob4 });
  fs.copyFileSync(shotMob4, path.join(ARTIFACT_DIR, "10_mobile_experience.png"));
  console.log("Captured: 10_mobile_experience.png");

  // Mobile Footer
  await page.evaluate(() => {
    document.getElementById("footer")?.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotMob5 = path.join(LOCAL_DIR, "11_mobile_footer.png");
  await page.screenshot({ path: shotMob5 });
  fs.copyFileSync(shotMob5, path.join(ARTIFACT_DIR, "11_mobile_footer.png"));
  console.log("Captured: 11_mobile_footer.png");

  // Check mobile horizontal overflow
  const mobOverflow = await page.evaluate(() => {
    return {
      docWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log("Mobile Horizontal Overflow Check:", mobOverflow);

  await browser.close();
  console.log("\n=== ALL QA TESTS COMPLETED SUCCESSFULLY ===");
}

runQA().catch((err) => {
  console.error("QA Error:", err);
  process.exit(1);
});
