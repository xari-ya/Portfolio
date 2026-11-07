const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { launch } = require('../browser.cjs');
const label = process.argv[2] || 'after';
const base = process.env.WORKSHOP_BASE_URL || 'http://127.0.0.1:4174';
const output = path.resolve('verification/test-results/presentation', label);
fs.mkdirSync(output, { recursive: true });
const report = { label, base, errors: [], captures: [], checks: [] };
const unwanted = /conceptual 3D reconstructions|not manufacturing CAD|ILLUSTRATIVE MAZE|NO LIVE FORECAST DATA|fabrication sign-off|artistic demonstrations|ADVANCE DEMO WORKFLOW|DEMO STATE|SOURCE & ENGINEERING NOTES|Actual application screens from|REAL-TIME BOTANICAL ENGINE|Habit titles, notes, exact Garden XP/i;
(async () => {
  const browser = await launch();
  try {
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 760, hasTouch: width < 760, deviceScaleFactor: 1 });
      page.on('pageerror', e => report.errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`); });
      await page.goto(base);
      await page.waitForFunction(() => window.__portfolioReady && !window.__kiraSequence.active && window.__engineerScene.renderer.getState().ready, null, { timeout: 90000 });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.body.classList.contains('has-no-webgl')), false);
      async function capture(state) {
        await page.waitForTimeout(850);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${state}: horizontal overflow`);
        const file = `${width}-${state}.png`;
        await page.screenshot({ path: path.join(output, file) });
        report.captures.push({ file, width, height, state });
      }
      for (const state of ['overview', 'production', 'lab']) {
        await page.evaluate(id => WorkshopNavigation.navigate(id, { instant: true }), state);
        await page.waitForTimeout(1400);
        await capture(state);
      }
      for (const id of ['obsidian', 'terravita', 'jellycast', 'click-claim', 'analog-fsk', 'habitseed', 'prajaa']) {
        await page.evaluate(id => ProjectStudy.open(id, { resume: false }), id);
        await page.waitForFunction(id => ProjectStudy.active && ProjectStudy.frame().project.id === id && ProjectStudy.frame().ready && ProjectStudy.frame().intro === 1, id, { timeout: 45000 });
        for (let chapter = 0; chapter < 3; chapter++) {
          await page.locator(`[data-study-chapter="${chapter}"]`).click();
          await capture(`${id}-${chapter}`);
          if (label !== 'before') {
            assert.doesNotMatch(await page.locator('#studyReading').innerText(), unwanted, `${id} chapter ${chapter}`);
            assert.equal(await page.locator('#claimAdvance, #claimStepStatus, .study-record-disclaimer').count(), 0);
          }
        }
        report.checks.push(`${width}: ${id}, all chapters ready and contained`);
      }
      await page.close();
      console.log(`Captured ${label} at ${width} × ${height}`);
    }
    assert.deepEqual(report.errors, []);
  } finally {
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
