import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
const root = process.cwd();
let failed = false;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
// 1) audio + save persistence on the single file
{
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(root, 'dist/warung-meong.html'));
  await page.waitForSelector('#title', { timeout: 60000 });
  await page.mouse.click(10, 10);
  const au = await page.evaluate(async () => {
    const S = window.__sound; S.unlock();
    await new Promise(r => setTimeout(r, 300));
    const names = ['click','pop','place','pickup','plop','nope','coin','ding','bell','beep','burn','trash','whoosh','sparkle','stir','pour','blend','eat','purr','happy','angry','fanfare','jingle','sad','sleep','scratch','boing'];
    for (const n of names) S[n]();
    S.meow(1); S.star(0); S.star(2);
    for (const k of ['anjing','kelinci','bebek','babi','katak','monyet','rubah','singa','pinguin','panda','beruang']) S.voice(k); S.voice('anjing','angry');
    S.setLoop('sizzle', 1); S.setLoop('bubble', 1); S.update();
    S.playSong('warung'); await new Promise(r => setTimeout(r, 600)); S.playSong('home'); await new Promise(r => setTimeout(r, 400)); S.playSong('evening');
    await new Promise(r => setTimeout(r, 400)); S.stopLoops(); S.update();
    return { state: S.ctx && S.ctx.state, t: S.ctx && S.ctx.currentTime.toFixed(2) };
  });
  console.log('audio', JSON.stringify(au));
  // exercise sound through the game: meow via house action, songs via flows
  await page.evaluate(async () => {
    const a = __wm;
    a.save.started = true; a.save.tips = { controls: true, howto: true };
    a.ui.hideTitle(); a.house.enterPlay('bed'); a.enterHouseHud();
    a.house.meow();
    a.save.coins = 77; a.persist();
  });
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('warungMeong.save.v1')).coins; } catch (e) { return 'ERR ' + e.message; } });
  console.log('saved coins in localStorage:', st);
  await page.reload();
  await page.waitForSelector('#title', { timeout: 60000 });
  console.log('after reload coins:', await page.evaluate(() => __wm.save.coins), 'title has Lanjut:', await page.evaluate(() => document.querySelector('#t-play').textContent.includes('Lanjut')));
  console.log('page errors:', errs.join(' | ') || 'none');
  if (errs.length) failed = true;
  await ctx.close();
}
// 2) PWA offline
const srv = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: path.join(root, 'dist/pwa'), stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1200));
{
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('http://127.0.0.1:8765/');
  await page.waitForSelector('#title', { timeout: 60000 });
  const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  console.log('service worker active:', sw);
  await page.waitForTimeout(1500);
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('#title', { timeout: 60000 });
  console.log('offline reload OK, manifest link:', await page.evaluate(() => !!document.querySelector('link[rel=manifest]')));
  console.log('pwa errors:', errs.join(' | ') || 'none');
  if (errs.length) failed = true;
  await ctx.close();
}
srv.kill();
await browser.close();
if (failed) process.exit(1);
console.log('ok');
