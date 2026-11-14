import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIDEO_PATH = 'C:/Users/SuriyaVS/.gemini/antigravity/brain/58b64365-08e0-4343-af70-8254ddcc9d70/.user_uploaded/media_1794637013954_91d65919.mp4';
const OUT_DIR = 'D:/Irisique/screenshots/ref_video';
const HTML_PATH = 'D:/Irisique/scripts/player.html';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(HTML_PATH, `
<!DOCTYPE html>
<html>
<body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; height:100vh;">
  <video id="vid" src="${VIDEO_PATH}" style="max-width:100%; max-height:100%;" autoplay muted></video>
</body>
</html>
`);

async function inspectVideo() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('file:///' + HTML_PATH.replace(/\\/g, '/'), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  const duration = await page.evaluate(() => {
    const vid = document.getElementById('vid');
    return vid.duration || 0;
  });

  console.log(`Video duration: ${duration}s`);
  const snapCount = 5;
  const dur = duration > 0 ? duration : 10;
  for (let i = 0; i < snapCount; i++) {
    const t = (i / (snapCount - 1)) * Math.max(0.1, dur - 0.5);
    await page.evaluate((time) => {
      const vid = document.getElementById('vid');
      vid.pause();
      vid.currentTime = time;
    }, t);
    await new Promise(r => setTimeout(r, 600));
    const outPath = path.join(OUT_DIR, `snap_${i}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved snap_${i}.png at ${t.toFixed(1)}s`);
  }

  await browser.close();
}

inspectVideo().then(() => console.log('Done')).catch(err => console.error(err));
