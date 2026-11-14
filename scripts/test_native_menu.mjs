import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500)); // wait for full hydration

  // Find bounding box of MENU button
  const box = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'MENU');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  console.log('MENU button center coords:', box);

  if (box) {
    // Native mouse click at exact coordinates
    await page.mouse.click(box.x, box.y);
    await new Promise(r => setTimeout(r, 600));

    const isOpen = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog;
    });
    console.log('Is menu dialog open after native click?', isOpen);

    if (isOpen) {
      await page.screenshot({ path: 'D:\\Irisique\\screenshots\\master\\02_menu_open_native.png' });
      console.log('Saved 02_menu_open_native.png');
    }
  }

  await browser.close();
}

test();
