import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Scroll to #art
  await page.evaluate(() => {
    const el = document.getElementById('art');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  const mainProps = await page.evaluate(() => {
    const plate = document.querySelector('[data-artwork-plate="true"]');
    const img = plate ? plate.querySelector('img') : null;
    const stage = plate ? plate.parentElement : null;
    const section = document.getElementById('art');
    const surface = section ? section.firstElementChild : null;

    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        opacity: s.opacity,
        filter: s.filter,
        backdropFilter: s.backdropFilter,
        mixBlendMode: s.mixBlendMode,
        transform: s.transform,
        backgroundColor: s.backgroundColor,
        width: s.width,
        height: s.height
      };
    }

    return {
      section: getStyles(section),
      surface: getStyles(surface),
      stage: getStyles(stage),
      plate: getStyles(plate),
      img: getStyles(img),
      imgSrc: img ? img.src : null,
      imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null
    };
  });

  console.log('MAIN GALLERY PROPS:', JSON.stringify(mainProps, null, 2));

  // Open modal
  await page.click('[data-explore-btn="true"]');
  await new Promise(r => setTimeout(r, 600));

  const popupProps = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const img = dialog ? dialog.querySelector('img') : null;
    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        opacity: s.opacity,
        filter: s.filter,
        backdropFilter: s.backdropFilter,
        mixBlendMode: s.mixBlendMode,
        transform: s.transform,
        backgroundColor: s.backgroundColor,
        width: s.width,
        height: s.height
      };
    }
    return {
      dialog: getStyles(dialog),
      img: getStyles(img),
      imgSrc: img ? img.src : null,
      imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null
    };
  });

  console.log('POPUP PROPS:', JSON.stringify(popupProps, null, 2));

  await browser.close();
}

diagnose().catch(console.error);
