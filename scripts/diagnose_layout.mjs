import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Log sections and pin spacers
  const layout = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, div[id="explore"], main > div'));
    const sectionInfo = sections.map(s => {
      const rect = s.getBoundingClientRect();
      const style = window.getComputedStyle(s);
      return {
        id: s.id,
        tagName: s.tagName,
        className: s.className,
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width },
        style: {
          position: style.position,
          display: style.display,
          minHeight: style.minHeight,
          height: style.height,
          padding: style.padding,
          zIndex: style.zIndex,
          overflow: style.overflow
        }
      };
    });

    const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer')).map(p => {
      const rect = p.getBoundingClientRect();
      const style = window.getComputedStyle(p);
      return {
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
        style: { padding: style.padding, margin: style.margin, height: style.height },
        firstChildId: p.firstElementChild?.id
      };
    });

    // Check ScrollTrigger markers or trigger ranges if available
    let triggers = [];
    if (window.ScrollTrigger) {
      triggers = window.ScrollTrigger.getAll().map((st, i) => ({
        idx: i,
        triggerId: st.trigger?.id,
        start: st.start,
        end: st.end,
        pin: !!st.pin,
        pinSpacer: !!st.spacer,
        vars: {
          start: st.vars.start,
          end: st.vars.end,
          pin: st.vars.pin,
          pinSpacing: st.vars.pinSpacing
        }
      }));
    }

    return {
      docHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      sectionInfo,
      pinSpacers,
      triggers
    };
  });

  console.log('=== DIAGNOSIS RESULTS ===');
  console.log('Document Scroll Height:', layout.docHeight);
  console.log('\n--- SECTIONS ---');
  layout.sectionInfo.forEach(s => console.log(JSON.stringify(s, null, 2)));
  console.log('\n--- PIN SPACERS ---');
  layout.pinSpacers.forEach(p => console.log(JSON.stringify(p, null, 2)));
  console.log('\n--- SCROLLTRIGGERS ---');
  layout.triggers.forEach(t => console.log(JSON.stringify(t, null, 2)));

  // Now simulate scrolling in steps and detect which section is in viewport and if overlaps occur
  console.log('\n--- SCROLL SAMPLES ---');
  const scrollSteps = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000];
  for (const sy of scrollSteps) {
    await page.evaluate((y) => window.scrollTo(0, y), sy);
    await new Promise(r => setTimeout(r, 100));
    const sample = await page.evaluate((y) => {
      const vh = window.innerHeight;
      const ids = ['explore', 'universe', 'gallery', 'couple', 'products', 'inquire'];
      const visible = ids.map(id => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        // Visible if partially in viewport:
        const inView = rect.top < vh && rect.bottom > 0;
        const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
        return {
          id,
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          inView,
          visibleHeight: Math.round(visibleHeight),
          visibleRatio: Math.round((visibleHeight / vh) * 100)
        };
      }).filter(Boolean);

      // Check headings visible
      const headings = Array.from(document.querySelectorAll('h1, h2')).map(h => {
        const r = h.getBoundingClientRect();
        const inView = r.top < vh && r.bottom > 0;
        const style = window.getComputedStyle(h);
        return {
          text: h.innerText.replace('\n', ' ').trim(),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          opacity: style.opacity,
          inView
        };
      }).filter(h => h.inView && parseFloat(h.opacity) > 0.05);

      return { scrollY: y, visible, headings };
    }, sy);

    console.log(`\nScrollY = ${sy}px:`);
    console.log('Visible sections:', sample.visible.filter(v => v.inView).map(v => `${v.id} (${v.visibleRatio}% vh)`).join(', '));
    console.log('Active Headings in view:', sample.headings.map(h => `"${h.text}" (top: ${h.top}px, op: ${h.opacity})`).join(' | '));
  }

  await browser.close();
}

diagnose().catch(console.error);
