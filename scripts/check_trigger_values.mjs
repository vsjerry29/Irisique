import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkTriggerValues() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?motionDebug=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    // expose ScrollTrigger via MotionDebugPanel if possible or access via document
    let stList = [];
    if (window.ScrollTrigger) {
      stList = window.ScrollTrigger.getAll().map(st => ({
        triggerId: st.trigger?.id,
        start: st.start,
        end: st.end,
        pin: !!st.pin,
        spacer: !!st.spacer
      }));
    }
    return stList;
  });

  console.log('ScrollTriggers:', result);
  await browser.close();
}

checkTriggerValues().catch(console.error);
