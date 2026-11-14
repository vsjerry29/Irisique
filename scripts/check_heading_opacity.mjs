import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkHeadingOpacity() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?motionDebug=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  for (const y of [5000, 5500, 6000, 6200, 6300, 6500, 7000]) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));
    const h = await page.evaluate(() => {
      const couple = document.getElementById('couple');
      const heading = couple?.querySelector('h2');
      const st = window.ScrollTrigger.getAll().find(s => s.trigger?.id === 'couple');
      return {
        y: window.scrollY,
        stProgress: st ? st.progress : null,
        stStart: st ? st.start : null,
        stEnd: st ? st.end : null,
        headingOpacity: heading ? window.getComputedStyle(heading).opacity : null,
        headingTransform: heading ? window.getComputedStyle(heading).transform : null,
      };
    });
    console.log(`y=${y}: stProgress=${h.stProgress?.toFixed(3)}, headingOpacity=${h.headingOpacity}, headingTransform=${h.headingTransform}`);
  }

  await browser.close();
}

checkHeadingOpacity().catch(console.error);
