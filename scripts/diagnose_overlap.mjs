import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Get info at scroll = 0
  const info0 = await page.evaluate(() => {
    const hero = document.querySelector('[data-section="unified-iris"]');
    const art = document.querySelector('#art');
    const collection = document.querySelector('[data-section="collection"]');
    const coupleBtn = document.querySelector('button[data-tab="COUPLE"]');
    
    return {
      hero: hero ? { offsetTop: hero.offsetTop, clientHeight: hero.clientHeight, bounding: hero.getBoundingClientRect() } : null,
      art: art ? { offsetTop: art.offsetTop, clientHeight: art.clientHeight, scrollHeight: art.scrollHeight, bounding: art.getBoundingClientRect() } : null,
      collection: collection ? { offsetTop: collection.offsetTop, clientHeight: collection.clientHeight, bounding: collection.getBoundingClientRect() } : null,
    };
  });
  console.log('Scroll 0 metrics:', JSON.stringify(info0, null, 2));

  // Scroll to p=1.0 of hero (where transition finishes, scroll ~ 1035px)
  await page.evaluate(() => window.scrollTo(0, 1035));
  await new Promise(r => setTimeout(r, 600));

  // Switch to COUPLE tab (as shown in user image media_1794840475294_88fbb929.jpg)
  await page.evaluate(() => {
    const coupleBtn = document.querySelector('button[data-tab="COUPLE"]');
    if (coupleBtn) coupleBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const info1035 = await page.evaluate(() => {
    const hero = document.querySelector('[data-section="unified-iris"]');
    const art = document.querySelector('#art');
    const collection = document.querySelector('[data-section="collection"]');
    const artworkPlate = document.querySelector('[data-artwork-plate="true"]');
    const activeCompImg = artworkPlate ? artworkPlate.querySelector('img') : null;
    
    return {
      artRect: art ? art.getBoundingClientRect() : null,
      artScrollHeight: art ? art.scrollHeight : null,
      artworkPlateRect: artworkPlate ? artworkPlate.getBoundingClientRect() : null,
      collectionRect: collection ? collection.getBoundingClientRect() : null,
      windowInnerHeight: window.innerHeight,
      scrollY: window.scrollY
    };
  });
  console.log('Scroll 1035 (COUPLE active) metrics:', JSON.stringify(info1035, null, 2));

  // Now scroll further (e.g. scroll 1500px, 2000px)
  await page.evaluate(() => window.scrollTo(0, 1600));
  await new Promise(r => setTimeout(r, 600));

  const info1600 = await page.evaluate(() => {
    const hero = document.querySelector('[data-section="unified-iris"]');
    const art = document.querySelector('#art');
    const collection = document.querySelector('[data-section="collection"]');
    return {
      heroRect: hero ? hero.getBoundingClientRect() : null,
      artRect: art ? art.getBoundingClientRect() : null,
      collectionRect: collection ? collection.getBoundingClientRect() : null,
      scrollY: window.scrollY
    };
  });
  console.log('Scroll 1600 metrics:', JSON.stringify(info1600, null, 2));

  await browser.close();
}

diagnose().catch(console.error);
