import { chromium } from 'playwright';
import fs from 'fs';
const out = 'test-shots/portrait';
const W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
await page.goto('file://' + process.cwd() + '/dist/warung-meong.html');
await page.waitForSelector('#title', { timeout: 60000 });
const shot = async (n) => { await page.waitForTimeout(400); await page.screenshot({ path: `${out}/${n}.png` }); };
await shot('p0-title');
await page.click('#t-play');
await page.waitForSelector('#charsel', { timeout: 30000 });
await page.waitForTimeout(1500);
await shot('p1-charsel');
await page.click('.cs-done');
await page.waitForTimeout(2500);
await shot('p2-house');
// joystick drag via pointer events on #touch
await page.evaluate(async () => {
  const t = document.getElementById('touch');
  const ev = (type, x, y) => t.dispatchEvent(new PointerEvent(type, { pointerId: 7, clientX: x, clientY: y, pointerType: 'touch', bubbles: true }));
  ev('pointerdown', 90, 700);
  for (let i = 0; i < 10; i++) { ev('pointermove', 90, 700 - i * 6); await new Promise(r => setTimeout(r, 30)); }
  window.__joyTest = __wm.input.vector();
});
await page.waitForTimeout(800);
console.log('joystick vector', JSON.stringify(await page.evaluate(() => window.__joyTest)));
await shot('p3-joystick');
await page.evaluate(() => { const t = document.getElementById('touch'); t.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', bubbles: true })); });
await page.evaluate(() => { const a = __wm; a.save.tips.howto = true; a.save.day = 4; a.warung.start(4); a.current = a.warung; a.ui.setHud('warung'); document.body.className = 'sky-warung'; a.warung.begin(); a.warung.bot = true; __sim(20); });
await shot('p4-warung');
await page.evaluate(() => { __sim(15); });
await shot('p5-warung2');
console.log(errs.slice(0, 10).join('\n'));
await browser.close();
if (errs.length) { console.error('ERRORS:\n' + errs.join('\n')); process.exit(1); }
console.log('ok');
