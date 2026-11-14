import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSortAndRefresh() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?motionDebug=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));

  console.log('--- BEFORE SORT/REFRESH ---');
  let result = await page.evaluate(() => {
    return window.ScrollTrigger.getAll().map(st => ({
      triggerId: st.trigger?.id,
      start: Math.round(st.start),
      end: Math.round(st.end),
      pin: !!st.pin
    }));
  });
  console.log(result);

  console.log('\n--- CALLING ScrollTrigger.sort() and ScrollTrigger.refresh() ---');
  result = await page.evaluate(() => {
    window.ScrollTrigger.sort();
    window.ScrollTrigger.refresh();
    return window.ScrollTrigger.getAll().map(st => ({
      triggerId: st.trigger?.id,
      start: Math.round(st.start),
      end: Math.round(st.end),
      pin: !!st.pin
    }));
  });
  console.log(result);

  console.log('\n--- TESTING SCROLL SAMPLES AFTER SORT/REFRESH ---');
  for (let y = 0; y <= 9000; y += 1000) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 50));
    const sample = await page.evaluate(() => {
      const vh = window.innerHeight;
      const ids = ['explore', 'universe', 'gallery', 'couple', 'products', 'inquire'];
      const visible = ids.map(id => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const inView = rect.top < vh && rect.bottom > 0;
        return inView ? id : null;
      }).filter(Boolean);
      return { y: window.scrollY, visible };
    });
    console.log(`ScrollY = ${sample.y}: visible = [${sample.visible.join(', ')}]`);
  }

  await browser.close();
}

testSortAndRefresh().catch(console.error);
