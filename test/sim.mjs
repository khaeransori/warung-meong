import { chromium } from 'playwright';
const days = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const runs = +(process.argv[3] || 3);
const upg = process.argv[4] || '';
const skill = process.argv[5] || '';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
await page.goto('file://' + process.cwd() + '/dist/warung-meong.html');
await page.waitForSelector('#title', { timeout: 60000 });
const res = await page.evaluate(({ days, runs, upg, skill }) => {
  const a = __wm;
  a.ui.hideTitle();
  a.save.started = true;
  a.save.upgrades = {};
  for (const u of upg.split(',').filter(Boolean)) a.save.upgrades[u] = true;
  const out = {};
  let captured = null;
  a.onDayFinished = (R) => { captured = R; };
  for (const d of days) {
    out[d] = [];
    for (let r = 0; r < runs; r++) {
      a.save.day = d;
      a.warung.start(d);
      a.current = a.warung;
      a.warung.bot = true;
      a.warung.botSkill = skill === 'kid' ? { delay: 1.0, speed: 0.7, stir: false, wander: 0.2 } : skill === 'mid' ? { delay: 0.5, speed: 0.85, stir: true, wander: 0.08 } : null;
      a.warung.begin();
      captured = null;
      let t = 0;
      while (!captured && t < 400) { a.frameSim(1 / 30); t += 1 / 30; }
      const R = captured || { earned: a.warung.earned, served: a.warung.served, angry: a.warung.angry, timeout: true };
      out[d].push({ earned: R.earned, served: R.served, angry: R.angry, stars: R.stars, combo: R.bestCombo, t: Math.round(t), timeout: !!R.timeout });
      a.warung.exit();
    }
  }
  return out;
}, { days, runs, upg, skill });
for (const d of Object.keys(res)) {
  const arr = res[d];
  const avg = arr.reduce((s, x) => s + x.earned, 0) / arr.length;
  console.log('day', d, 'avg', avg.toFixed(0), JSON.stringify(arr));
}
console.log(errs.slice(0, 5).join('\n'));
await browser.close();
if (errs.length) { console.error('ERRORS:\n' + errs.join('\n')); process.exit(1); }
console.log('ok');
