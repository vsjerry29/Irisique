const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  const heroInfo = await page.evaluate(() => {
    const heroText = document.querySelector('h1');
    const heroCTA = document.querySelector('a[href="/book"]');
    const heroContainer = heroText ? heroText.parentElement : null;
    const heroRef = heroText ? heroText.closest('[class*="z-25"]') : null;
    return {
      heroTextFound: !!heroText,
      heroTextContent: heroText ? heroText.innerText : null,
      heroRefFound: !!heroRef,
      heroRefClass: heroRef ? heroRef.className : null,
      heroRefOpacity: heroRef ? window.getComputedStyle(heroRef).opacity : null,
      heroRefZIndex: heroRef ? window.getComputedStyle(heroRef).zIndex : null,
      heroCTAText: heroCTA ? heroCTA.innerText : null,
    };
  });
  console.log('Hero Info at 1s:', JSON.stringify(heroInfo, null, 2));

  // Check section metrics
  const sectionInfo = await page.evaluate(() => {
    const hero = document.querySelector('[data-section="unified-iris"]');
    const art = document.querySelector('#art');
    const collection = document.querySelector('[data-section="collection"]');
    return {
      heroRect: hero ? hero.getBoundingClientRect() : null,
      artRect: art ? art.getBoundingClientRect() : null,
      collectionRect: collection ? collection.getBoundingClientRect() : null,
      artScrollHeight: art ? art.scrollHeight : null,
      artClientHeight: art ? art.clientHeight : null,
    };
  });
  console.log('Section Info:', JSON.stringify(sectionInfo, null, 2));

  await browser.close();
})();
