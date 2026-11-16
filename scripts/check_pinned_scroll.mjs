import puppeteer from "puppeteer-core";

async function test() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1758, height: 830 });
  await page.goto("http://localhost:3000?transitionDebug=1", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 2200));

  const scrollInfo = await page.evaluate(() => {
    const st = window.ScrollTrigger.getAll()[0];
    return {
      start: st.start,
      end: st.end,
      totalDistance: st.end - st.start,
    };
  });
  console.log("ScrollTrigger info:", scrollInfo);

  // Scroll to 95% of the pinned hero
  const targetY = scrollInfo.start + scrollInfo.totalDistance * 0.95;
  console.log("Scrolling to targetY:", targetY);
  await page.evaluate((y) => window.scrollTo(0, y), targetY);
  await new Promise(r => setTimeout(r, 600));

  const hudInfo = await page.evaluate(() => {
    return {
      p: document.getElementById("td-p")?.innerText,
      state: document.getElementById("td-state")?.innerText,
      bg: document.getElementById("td-bg")?.innerText,
      canvasOp: document.getElementById("td-canvas-opacity")?.innerText,
      coupleBtnRect: document.querySelector("button[data-tab='COUPLE']")?.getBoundingClientRect(),
    };
  });
  console.log("HUD Info at 95%:", hudInfo);

  await browser.close();
}

test();
