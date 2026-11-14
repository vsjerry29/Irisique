import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkST() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const data = await page.evaluate(() => {
    // We can get triggers via ScrollTrigger from gsap
    // Let's inspect the DOM elements that have _gsap
    const triggers = [];
    document.querySelectorAll('*').forEach(el => {
      if (el._gsap) {
        // check if has trigger
      }
    });

    // Check all pin spacers
    const spacers = Array.from(document.querySelectorAll('.pin-spacer')).map(sp => {
      const child = sp.firstElementChild;
      return {
        childId: child?.id,
        offsetTop: sp.offsetTop,
        offsetHeight: sp.offsetHeight,
        childHeight: child?.offsetHeight,
        paddingBottom: sp.style.paddingBottom
      };
    });

    const sections = ['explore', 'universe', 'gallery', 'couple', 'products', 'inquire'].map(id => {
      const el = document.getElementById(id);
      return {
        id,
        offsetTop: el ? el.offsetTop : null,
        parentClass: el ? el.parentElement?.className : null,
        parentOffsetTop: el ? el.parentElement?.offsetTop : null,
        offsetHeight: el ? el.offsetHeight : null
      };
    });

    return { spacers, sections };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

checkST().catch(console.error);
