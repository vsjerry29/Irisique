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
  
  await page.evaluate(() => window.scrollTo(0, 3200));
  await new Promise(r => setTimeout(r, 800));

  console.log("Hovering and clicking COUPLE button with Puppeteer...");
  const coupleBtn = await page.$("button[data-tab='COUPLE']");
  if (coupleBtn) {
    const box = await coupleBtn.boundingBox();
    console.log("COUPLE bounding box:", box);
    await coupleBtn.hover();
    await new Promise(r => setTimeout(r, 200));
    await coupleBtn.click();
  } else {
    console.log("COUPLE button not found!");
  }
  await new Promise(r => setTimeout(r, 1000));

  const afterClick = await page.evaluate(() => {
    const coupleBtn = document.querySelector("button[data-tab='COUPLE']");
    const exploreBtn = document.querySelector("button[data-explore-btn]");
    return {
      couplePressed: coupleBtn?.getAttribute("aria-pressed"),
      exploreText: exploreBtn?.innerText
    };
  });
  console.log("After click:", afterClick);
  await browser.close();
}

test();
