import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkSTInstances() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?motionDebug=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const triggers = await page.evaluate(() => {
    // We have ScrollTrigger imported in MotionDebugPanel or window
    // In MotionDebugPanel, ScrollTrigger is imported
    // Let's check window.__irisHomepageTimeline or other objects
    return Array.from(document.querySelectorAll('.pin-spacer')).map(sp => {
      const el = sp.firstElementChild;
      return {
        id: el?.id,
        spTop: sp.offsetTop,
        spHeight: sp.offsetHeight,
        spPaddingBottom: sp.style.paddingBottom
      };
    });
  });

  console.log('Spacers:', triggers);

  // Let's scroll through and take screenshots or log bounding rects of couple, gallery, universe
  for (let y = 2500; y <= 6000; y += 500) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 50));
    const r = await page.evaluate(() => {
      const g = document.getElementById('gallery');
      const c = document.getElementById('couple');
      const u = document.getElementById('universe');
      return {
        y: window.scrollY,
        gallery: { top: g?.getBoundingClientRect().top, pos: window.getComputedStyle(g).position },
        couple: { top: c?.getBoundingClientRect().top, pos: window.getComputedStyle(c).position, parentTop: c?.parentElement?.getBoundingClientRect().top },
        universe: { top: u?.getBoundingClientRect().top, pos: window.getComputedStyle(u).position }
      };
    });
    console.log(`y=${r.y}: Gallery top=${r.gallery.top} (${r.gallery.pos}), Couple top=${r.couple.top} (${r.couple.pos}, parentTop=${r.couple.parentTop}), Universe top=${r.universe.top} (${r.universe.pos})`);
  }

  await browser.close();
}

checkSTInstances().catch(console.error);
