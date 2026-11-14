import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkCouple() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const yPositions = [2000, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000];
  for (const y of yPositions) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));
    const info = await page.evaluate(() => {
      const couple = document.getElementById('couple');
      const gallery = document.getElementById('gallery');
      const universe = document.getElementById('universe');
      const products = document.getElementById('products');

      const getDetails = (el, name) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        const parent = el.parentElement;
        const pr = parent?.getBoundingClientRect();
        const pcs = parent ? window.getComputedStyle(parent) : null;
        return {
          name,
          rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) },
          pos: cs.position,
          zIndex: cs.zIndex,
          opacity: cs.opacity,
          transform: cs.transform,
          parentClass: parent?.className,
          parentRect: pr ? { top: Math.round(pr.top), bottom: Math.round(pr.bottom), height: Math.round(pr.height) } : null
        };
      };

      return {
        scrollY: window.scrollY,
        couple: getDetails(couple, 'couple'),
        gallery: getDetails(gallery, 'gallery'),
        universe: getDetails(universe, 'universe'),
        products: getDetails(products, 'products')
      };
    });
    console.log(`\n=== ScrollY: ${info.scrollY} ===`);
    console.log('UNIVERSE:', JSON.stringify(info.universe));
    console.log('GALLERY:', JSON.stringify(info.gallery));
    console.log('COUPLE:', JSON.stringify(info.couple));
    console.log('PRODUCTS:', JSON.stringify(info.products));
  }

  await browser.close();
}

checkCouple().catch(console.error);
