const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(process.env.TEMP || process.cwd(), 'map-scrolly-camera-check');
fs.mkdirSync(outputDir, { recursive: true });
const routeFixture = {
  code: 'Ok',
  routes: [{
    distance: 7400,
    duration: 1020,
    geometry: { coordinates: [
      [-122.4476, 37.7545], [-122.445, 37.762], [-122.454, 37.771],
      [-122.46, 37.786], [-122.467, 37.798], [-122.47498, 37.80778],
    ] },
    legs: [{ steps: [
      { name: 'Twin Peaks Boulevard', distance: 2200 },
      { name: 'Portola Drive', distance: 1800 },
      { name: 'Presidio Parkway', distance: 3400 },
    ] }],
  }],
};
const viewports = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'tablet', width: 820, height: 1180, isMobile: true },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.isMobile ? 2 : 1,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
    });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.route('**/route/v1/driving/**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(routeFixture),
    }));
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.locator('.maplibregl-canvas').waitFor({ timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('.route-status')?.textContent?.includes('Road route ready'));
    await page.waitForTimeout(500);

    const markerPosition = async () => page.locator('.map-pin--start').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { x: Math.round(bounds.x + bounds.width / 2), y: Math.round(bounds.y + bounds.height / 2) };
    });
    const beforeMarker = await markerPosition();
    const beforeMap = await page.locator('.map-canvas').screenshot({
      path: path.join(outputDir, `${viewport.name}-before-map.png`),
    });
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-before.png`) });

    await page.evaluate(() => document.getElementById('chapter-4').click());
    await page.waitForFunction(() => {
      const progress = Number.parseInt(document.querySelector('.map-stage__progress-bottom span:last-child')?.textContent ?? '0', 10);
      return progress > 5;
    }, { timeout: 8000 });
    await page.waitForTimeout(1200);

    const afterState = await page.evaluate(() => ({
      y: window.scrollY,
      activeChapter: document.querySelector('.chapter-card[aria-current="step"]')?.id ?? null,
      progress: document.querySelector('.map-stage__progress-bottom span:last-child')?.textContent ?? null,
      travelerVisible: Boolean(document.querySelector('.map-traveler')),
    }));
    const afterMarker = await markerPosition();
    const afterMap = await page.locator('.map-canvas').screenshot({
      path: path.join(outputDir, `${viewport.name}-after-map.png`),
    });
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-after.png`) });

    results.push({
      viewport: viewport.name,
      beforeMarker,
      afterMarker,
      markerMoved: beforeMarker.x !== afterMarker.x || beforeMarker.y !== afterMarker.y,
      afterState,
      mapPixelsChanged: !beforeMap.equals(afterMap),
      pageErrors,
      screenshots: outputDir,
    });
    await page.close();
  }

  await browser.close();
  process.stdout.write(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  process.stderr.write(error.stack || String(error));
  process.exitCode = 1;
});
