import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const vp of [{ name: 'Desktop', width: 1440, height: 900 }, { name: 'Mobile', width: 390, height: 844 }]) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const metrics = await page.evaluate(() => {
      const sections = [
        { id: 'art', el: document.querySelector('#art') },
        { id: 'collection', el: document.querySelector('[data-section="collection"]') },
        { id: 'experience', el: document.querySelector('#experience') },
        { id: 'booking', el: document.querySelector('#booking') },
        { id: 'footer', el: document.querySelector('#footer') }
      ];

      const postHeroTop = sections[0].el ? sections[0].el.getBoundingClientRect().top + window.scrollY : 0;

      return sections.map(s => {
        if (!s.el) return { id: s.id, missing: true };
        const r = s.el.getBoundingClientRect();
        const absTop = r.top + window.scrollY;
        return {
          id: s.id,
          absTop,
          relTop: absTop - postHeroTop,
          height: s.el.offsetHeight,
          relBottom: (absTop + s.el.offsetHeight) - postHeroTop
        };
      });
    });

    console.log(`=== ${vp.name.toUpperCase()} (width: ${vp.width}) ===`);
    console.log(JSON.stringify(metrics, null, 2));
    await page.close();
  }

  await browser.close();
}

check().catch(console.error);
