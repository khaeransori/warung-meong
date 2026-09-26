// Builds the installable offline PWA folder + zip from dist/warung-meong.html
import fs from 'fs';
import { execSync } from 'child_process';
import sharp from 'sharp';

const dir = 'dist/pwa';
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

const BG = { r: 46, g: 196, b: 182, alpha: 1 }; // teal behind the cat head (same as assets/icon.png)
const src = 'assets/icon.png';
await sharp(src).resize(192, 192).png().toFile(`${dir}/icon-192.png`);
await sharp(src).resize(512, 512).png().toFile(`${dir}/icon-512.png`);
await sharp(src).resize(180, 180).png().toFile(`${dir}/apple-touch-icon.png`);
// maskable: keep the face inside the safe zone
const inner = await sharp(src).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
  .composite([{ input: inner, left: 56, top: 56 }]).png().toFile(`${dir}/icon-maskable.png`);

const manifest = {
  name: 'Warung Meong',
  short_name: 'Warung Meong',
  description: 'Game masak 3D kotak-kotak: jadi kucing koki dan layani pelanggan!',
  lang: 'id',
  start_url: './',
  scope: './',
  display: 'fullscreen',
  orientation: 'landscape',
  background_color: '#fff8ec',
  theme_color: '#ff8c42',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(`${dir}/manifest.webmanifest`, JSON.stringify(manifest, null, 2));

const version = 'wm-' + Date.now().toString(36);
fs.writeFileSync(`${dir}/sw.js`, `const CACHE = '${version}';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Game page: network-first (newest version shows right away when online),
// falls back to the cache when offline or the network is slow (>4 s).
// Icons & manifest: cache-first.
function fresh(req) {
  const net = fetch(req, { cache: 'no-cache' }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
    return res;
  });
  const slow = new Promise((ok) => setTimeout(ok, 4000)).then(() => caches.match('./index.html'));
  return Promise.race([net, slow.then((hit) => hit || net)]).catch(() => caches.match('./index.html'));
}
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) { e.respondWith(fresh(e.request)); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
`);

let html = fs.readFileSync('dist/warung-meong.html', 'utf8');
html = html.replace('<!--PWA-->', `<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">`);
html = html.replace('<!--SW-->', `<script>if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function(){});</script>`);
fs.writeFileSync(`${dir}/index.html`, html);

fs.writeFileSync(`${dir}/CARA-PASANG.txt`, `WARUNG MEONG — versi aplikasi (PWA)

1. Upload SEMUA file di folder ini ke hosting statis HTTPS mana saja:
   GitHub Pages, Netlify Drop (app.netlify.com/drop), atau Cloudflare Pages.
2. Buka alamatnya sekali di HP pakai Chrome (Android) atau Safari (iPhone) selagi ada internet.
3. Android: menu titik tiga > "Tambahkan ke Layar utama" / "Instal aplikasi".
   iPhone: tombol Bagikan > "Tambah ke Layar Utama".
4. Selesai. Ikon Warung Meong muncul di layar HP, bisa dimainkan tanpa internet,
   dan progres (koin, bintang, baju, piala) tersimpan.

Kontrol: geser jempol kiri untuk jalan, tekan tombol bulat besar di kanan
untuk ambil / masak / antar.
`);

try { fs.rmSync('dist/warung-meong-pwa.zip'); } catch (e) { /* none yet */ }
execSync(`cd ${dir} && zip -q -r ../warung-meong-pwa.zip .`);
console.log('pwa ok', fs.readdirSync(dir).join(', '));
