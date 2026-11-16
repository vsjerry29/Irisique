import puppeteer from 'puppeteer-core';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1758, height: 830, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4500));
  
  // Total scroll distance
  const scrollInfo = await page.evaluate(() => {
    const trigger = document.querySelector('[data-section="unified-iris"]');
    return {
      innerHeight: window.innerHeight,
      scrollHeight: document.body.scrollHeight,
      triggerRect: trigger ? trigger.getBoundingClientRect() : null
    };
  });
  console.log('Scroll info at start:', scrollInfo);

  // Scroll to 1452 (p=1.0)
  await page.evaluate(() => window.scrollTo(0, 1452));
  await new Promise(r => setTimeout(r, 1200));
  
  const info = await page.evaluate(() => {
    const hero = document.querySelector('[data-section="unified-iris"]');
    const canvas = document.querySelector('canvas');
    return {
      scrollY: window.scrollY,
      canvasOpacity: canvas ? canvas.style.opacity : null,
      childrenOfHero: hero ? Array.from(hero.children).map(c => ({
        tag: c.tagName,
        id: c.id,
        class: String(c.className).substring(0, 50),
        style: c.getAttribute('style'),
        computedZIndex: window.getComputedStyle(c).zIndex,
        computedVisibility: window.getComputedStyle(c).visibility,
        computedOpacity: window.getComputedStyle(c).opacity
      })) : []
    };
  });
  console.log('DOM info at scroll 1452:', JSON.stringify(info, null, 2));
  await browser.close();
}
test();
