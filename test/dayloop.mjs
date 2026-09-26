import { chromium } from 'playwright';
import fs from 'fs';
const out = 'test-shots/dayloop';
const W = +(process.argv[3] || 844), H = +(process.argv[4] || 390);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
await page.goto('file://' + process.cwd() + '/dist/warung-meong.html');
await page.waitForSelector('#title', { timeout: 60000 });
const shot = async (n) => { await page.waitForTimeout(400); await page.screenshot({ path: `${out}/${n}.png` }); };
await page.evaluate(() => { const a = __wm; a.save.started = true; a.save.tips = { controls: true }; a.ui.hideTitle(); a.house.enterPlay('bed'); a.enterHouseHud(); a.openDayPicker(); });
await page.waitForTimeout(600);
await page.click('.dayb.next', { force: true });
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(700);
  const b = await page.$('.panel .foot .btn.green');
  if (b) { await b.click(); }
  if (await page.evaluate(() => __wm.warung.running)) break;
}
await page.evaluate(() => { __wm.warung.bot = true; });
await page.waitForTimeout(3000);
await shot('r0-day1-play');
const info = await page.evaluate(() => ({ calls: __wm.renderer.info.render.calls, tris: __wm.renderer.info.render.triangles, geos: __wm.renderer.info.memory.geometries, tex: __wm.renderer.info.memory.textures }));
console.log('render info', JSON.stringify(info));
await page.evaluate(() => { __sim(120); });
await page.waitForSelector('.stars-big', { timeout: 20000 });
await page.waitForTimeout(2500);
await shot('r1-results');
await page.click('.panel .foot .btn.green');
await page.waitForTimeout(6500);
await shot('r2-home-evening');
console.log(JSON.stringify(await page.evaluate(() => ({ day: __wm.save.day, coins: __wm.save.coins, stars: __wm.save.stars, trophies: __wm.save.trophies, time: __wm.save.time }))));
// sleep
await page.evaluate(() => { __wm.goSleep(); });
await page.waitForTimeout(5000);
await shot('r3-morning');
console.log(JSON.stringify(await page.evaluate(() => ({ day: __wm.save.day, time: __wm.save.time }))));
console.log(errs.slice(0, 10).join('\n'));
await browser.close();
if (errs.length) { console.error('ERRORS:\n' + errs.join('\n')); process.exit(1); }
console.log('ok');
