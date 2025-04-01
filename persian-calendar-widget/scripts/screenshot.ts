
import puppeteer from 'puppeteer';

const widgets = [
  { url: 'https://notion-persian-calendar.vercel.app/calendar/today?grey', name: 'today-grey', width: 140, height: 140 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/today?dark', name: 'today-dark', width: 140, height: 140 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/small?grey', name: 'small-grey', width: 240, height: 240 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/small?dark', name: 'small-dark', width: 240, height: 240 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/wide?grey', name: 'wide-grey', width: 600, height: 320 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/wide?dark', name: 'wide-dark', width: 600, height: 320 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/full?grey', name: 'full-grey', width: 330, height: 440 },
  { url: 'https://notion-persian-calendar.vercel.app/calendar/full?dark', name: 'full-dark', width: 330, height: 440 },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const { url, name, width, height } of widgets) {
    await page.setViewport({ width: width + 20, height: height + 20, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.evaluate(() => document.body.style.background = 'transparent');
    await new Promise(r => setTimeout(r, 1500));

    const widget = await page.$('[class*="w-\\[140px\\]"], [class*="w-\\[240px\\]"], [class*="w-\\[330px\\]"], [class*="w-\\[600px\\]"]');
    if (!widget) { console.log(`Widget not found for ${url}`); continue; }

    await widget.screenshot({ path: `./${name}.png`, omitBackground: true });
    console.log(`Captured ${name}`);
  }

  await browser.close();
})();
