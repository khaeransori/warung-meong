// Re-renders assets/icon.png (the 3D cat-chef head) from the built game. Needs Chromium:
//   npx playwright install chromium && npm run build && node tools/icon.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
await page.goto('file://' + path.resolve('dist/warung-meong.html'));
await page.waitForSelector('#title', { timeout: 60000 });
const url = await page.evaluate(() => __catHead(512, '#2ec4b6'));
fs.writeFileSync('assets/icon.png', Buffer.from(url.split(',')[1], 'base64'));
await browser.close();
console.log('assets/icon.png updated');
