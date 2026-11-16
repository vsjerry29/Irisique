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
  
  // Scroll to settled gallery (1452)
  await page.evaluate(() => window.scrollTo(0, 1452));
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/exact_hero_scroll_zoom_qa/test_gallery_solo.png' });
  
  // Click Couple tab
  await page.click('[data-tab="COUPLE"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/exact_hero_scroll_zoom_qa/test_gallery_couple.png' });
  
  // Click Family tab
  await page.click('[data-tab="FAMILY"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/screenshots/exact_hero_scroll_zoom_qa/test_gallery_family.png' });
  
  console.log('Screenshots captured!');
  await browser.close();
}
test();
