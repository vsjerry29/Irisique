import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const triggers = await page.evaluate(() => {
    return window.ScrollTrigger ? window.ScrollTrigger.getAll().map(st => ({
      id: st.trigger?.id,
      start: st.start,
      end: st.end
    })) : 'ScrollTrigger not found';
  });
  console.log('ScrollTriggers:', triggers);

  // Get absolute bounding rects with page scroll
  const positions = await page.evaluate(() => {
    const ids = ['explore', 'iris-layers', 'gallery', 'couple', 'products', 'inquire'];
    return ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, missing: true };
      const r = el.getBoundingClientRect();
      return { id, top: r.top + window.scrollY, height: el.offsetHeight };
    });
  });
  console.log('Positions:', positions);

  await browser.close();
}

check();
