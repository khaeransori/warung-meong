// Bundles the game into one offline HTML file (+ a variant for Claude Artifacts).
import * as esbuild from 'esbuild';
import fs from 'fs';
import sharp from 'sharp';

const dev = process.argv.includes('--dev');
const BUILD = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' WIB';

const res = await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: !dev,
  format: 'iife',
  target: ['es2020'],
  write: false,
  legalComments: 'none',
  define: { __BUILD__: JSON.stringify(BUILD) },
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync('src/ui/style.css', 'utf8');
const font = (w) => `@font-face{font-family:'Fredoka';font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(`node_modules/@fontsource/fredoka/files/fredoka-latin-${w}-normal.woff2`).toString('base64')}) format('woff2')}`;
const fontCss = font(600) + '\n' + font(700);
const favicon = 'data:image/png;base64,' + (await sharp('assets/icon.png').resize(64, 64).png().toBuffer()).toString('base64');
const tpl = fs.readFileSync('src/index.html', 'utf8');

fs.mkdirSync('dist', { recursive: true });
// Full standalone document (offline file; pwa.mjs turns it into the PWA)
const full = tpl
  .replace('<!--HEAD-->', () => `<link rel="icon" type="image/png" href="${favicon}">\n<!--PWA-->`)
  .replace('<!--TAIL-->', () => '<!--SW-->')
  .replace('/*FONT*/', () => fontCss)
  .replace('/*CSS*/', () => css)
  .replace('/*JS*/', () => js);
fs.writeFileSync('dist/warung-meong.html', full);

// Claude Artifact variant: no doctype/html/head/body (the viewer adds its own skeleton), title first
const style = full.slice(full.indexOf('<style>'), full.indexOf('</style>') + 8);
const body = full.slice(full.indexOf('>', full.indexOf('<body')) + 1, full.lastIndexOf('</body>')).replace('<!--SW-->', '');
fs.writeFileSync('dist/warung-meong-artifact.html', `<title>Warung Meong</title>\n<meta name="theme-color" content="#ff8c42">\n${style}\n${body}`);

console.log(`build ${BUILD}: warung-meong.html ${(full.length / 1024).toFixed(0)} KB`);
