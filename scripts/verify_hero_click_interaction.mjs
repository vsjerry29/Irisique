import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = "screenshots/iris_click_qa";
const ARTIFACT_DIR = "C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/iris_click_qa";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function verifyClicks() {
  console.log("=== IRIS HERO CLICK INTERACTION VALIDATION (?irisDebug=1) ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load hero with developer HUD enabled
  await page.goto("http://localhost:3000/?irisDebug=1", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  // Skip or wait for intro to settle to full macroscopic iris
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 600));

  // Canvas bounds
  const canvasBounds = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  console.log("Canvas Bounds:", canvasBounds);

  const centerX = canvasBounds.left + canvasBounds.width / 2;
  const centerY = canvasBounds.top + canvasBounds.height / 2;

  // The iris radius in 1440x900 is baseRadius 0.465 * canvas height ~ 418px diameter (radius ~ 209px)
  const radius = 160; // 160px from center hits the active trabecular stroma

  const clickPoints = [
    { name: "1_North (Top)", x: centerX, y: centerY - radius },
    { name: "2_NorthEast (Top-Right)", x: centerX + radius * 0.707, y: centerY - radius * 0.707 },
    { name: "3_East (Right)", x: centerX + radius, y: centerY },
    { name: "4_SouthEast (Bottom-Right)", x: centerX + radius * 0.707, y: centerY + radius * 0.707 },
    { name: "5_South (Bottom)", x: centerX, y: centerY + radius },
    { name: "6_SouthWest (Bottom-Left)", x: centerX - radius * 0.707, y: centerY + radius * 0.707 },
    { name: "7_West (Left)", x: centerX - radius, y: centerY },
    { name: "8_NorthWest (Top-Left)", x: centerX - radius * 0.707, y: centerY - radius * 0.707 },
    { name: "9_Outside (Canvas Periphery)", x: centerX + 400, y: centerY },
  ];

  const results = [];

  for (const pt of clickPoints) {
    // Move mouse to position
    await page.mouse.move(pt.x, pt.y);
    await new Promise((r) => setTimeout(r, 80));

    // Click
    await page.mouse.click(pt.x, pt.y);
    await new Promise((r) => setTimeout(r, 180)); // Allow click wave to illuminate local stroma

    // Read debug HUD values
    const hudData = await page.evaluate(() => {
      const elUv = document.getElementById("dbg-uv")?.innerText || "";
      const elOrigin = document.getElementById("dbg-origin")?.innerText || "";
      const elHit = document.getElementById("dbg-hit")?.innerText || "";
      const elScroll = document.getElementById("dbg-scroll")?.innerText || "";
      return { uv: elUv, origin: elOrigin, hit: elHit, scroll: elScroll };
    });

    const isOutside = pt.name.includes("Outside");
    const passed = isOutside
      ? hudData.hit === "outside"
      : hudData.hit.includes("macroQuad") || hudData.hit.includes("Layer") || hudData.hit.includes("CLICK");

    results.push({
      point: pt.name,
      coords: `(${Math.round(pt.x)}, ${Math.round(pt.y)})`,
      resolvedUV: hudData.uv,
      revealOrigin: hudData.origin,
      hitObject: hudData.hit,
      passed,
    });

    // Capture screenshot for visual validation
    const shotPath = path.join(OUT_DIR, `click_${pt.name.split(" ")[0]}.png`);
    await page.screenshot({ path: shotPath });
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `click_${pt.name.split(" ")[0]}.png`));
    console.log(`Tested ${pt.name}: Origin=${hudData.origin}, Hit=${hudData.hit}, Passed=${passed}`);
  }

  // ── TEST AFTER SCROLLING (Rotated & Translated Iris) ──
  console.log("\n[TEST AFTER SCROLL] Testing rotated iris state...");
  await page.evaluate(() => window.scrollBy(0, 350));
  await new Promise((r) => setTimeout(r, 800));

  const rotatedClicks = [
    { name: "Rotated_1_Top", x: centerX, y: centerY - 140 },
    { name: "Rotated_2_Right", x: centerX + 140, y: centerY },
    { name: "Rotated_3_Bottom", x: centerX, y: centerY + 140 },
    { name: "Rotated_4_Left", x: centerX - 140, y: centerY },
  ];

  for (const pt of rotatedClicks) {
    await page.mouse.move(pt.x, pt.y);
    await new Promise((r) => setTimeout(r, 80));
    await page.mouse.click(pt.x, pt.y);
    await new Promise((r) => setTimeout(r, 180));

    const hudData = await page.evaluate(() => {
      const elUv = document.getElementById("dbg-uv")?.innerText || "";
      const elOrigin = document.getElementById("dbg-origin")?.innerText || "";
      const elHit = document.getElementById("dbg-hit")?.innerText || "";
      const elScroll = document.getElementById("dbg-scroll")?.innerText || "";
      return { uv: elUv, origin: elOrigin, hit: elHit, scroll: elScroll };
    });

    results.push({
      point: pt.name,
      coords: `(${Math.round(pt.x)}, ${Math.round(pt.y)})`,
      resolvedUV: hudData.uv,
      revealOrigin: hudData.origin,
      hitObject: hudData.hit,
      passed: hudData.hit !== "outside",
    });

    const shotPath = path.join(OUT_DIR, `${pt.name}.png`);
    await page.screenshot({ path: shotPath });
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `${pt.name}.png`));
    console.log(`Tested ${pt.name} (Scroll ${hudData.scroll}): Origin=${hudData.origin}, Hit=${hudData.hit}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "click_qa_results.json"), JSON.stringify(results, null, 2));
  await browser.close();
  console.log("\n=== ALL HERO CLICK TESTS COMPLETED ===");
}

verifyClicks().catch((err) => {
  console.error("QA Error:", err);
  process.exit(1);
});
