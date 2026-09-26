# Warung Meong

Game masak 3D kotak-kotak ala Roblox untuk anak. Kamu jadi kucing koki: bangun pagi di rumah, sarapan, lalu buka warung dan layani pelanggan hewan sebelum mereka bete. Dimainkan dengan sentuhan di HP, bisa jalan tanpa internet, dan semuanya ada dalam satu file HTML.

**Main sekarang:** https://khaeransori.github.io/warung-meong/

## Main di HP

1. Buka https://khaeransori.github.io/warung-meong/ di Chrome (Android) atau Safari (iPhone).
2. Android: menu titik tiga › **Instal aplikasi** / **Tambahkan ke Layar utama**.
   iPhone: tombol Bagikan › **Tambah ke Layar Utama**.
3. Setelah itu game bisa dimainkan tanpa internet, dan progresnya (koin, bintang, baju, piala) tersimpan di HP.

Alternatif tanpa hosting: unduh [warung-meong.html](https://khaeransori.github.io/warung-meong/warung-meong.html) lalu buka di Chrome. Di beberapa HP Android, progres tidak tersimpan kalau dibuka dari file. Kalau itu terjadi, game otomatis membuka semua hari.

## Isi game

- **Rumah 2 lantai:** kamar (kasur, lemari baju, cermin, laptop toko, rak piala) dan ruang makan (sarapan, buku resep, akuarium, pintu ke warung). Sarapan bikin jalan lebih cepat seharian.
- **Pilih kucing:** cowok atau cewek, 6 warna bulu, dan nama sendiri.
- **Warung:** ambil bahan, masak di alat yang benar, antar ke meja. Pelanggan: anjing, kelinci, panda, beruang, bebek, babi, monyet, katak, rubah, plus tamu VIP Pak Singa dan Juri Pinguin.
- **7 menu:** Es Teh, Nasi Goreng, Es Jeruk, Sate Ayam, Mie Goreng, Bakso, Pisang Goreng. Gorengan dan sate bisa gosong kalau telat diangkat.
- **10 hari + Hari Bebas:** tiap hari buka menu baru, target 1–3 bintang, combo, meja kotor, tamu VIP, dan juri di hari 10.
- **Belanja:** 10 upgrade warung (wajan kedua, kompor turbo, meja tambahan, radio, dll), 8 topi, 8 warna baju, 8 piala.
- **Bantuan:** panah oranye dan petunjuk singkat menunjukkan langkah berikutnya (bisa dimatikan di menu).
- Musik dan efek suara dibuat langsung dengan WebAudio, tanpa file audio.

Kontrol: joystick kiri (muncul di mana jempol menyentuh) dan tombol bulat besar di kanan. Di laptop: WASD/panah dan Spasi.

## Pengembangan

```bash
npm ci
npm run build     # hasil di dist/
npm run serve     # buka http://localhost:8080
```

Hasil build:

| File | Kegunaan |
| --- | --- |
| `dist/warung-meong.html` | Satu file offline, lengkap dengan font dan semua kode |
| `dist/pwa/` | Versi aplikasi (manifest, service worker, ikon) untuk di-hosting |
| `dist/warung-meong-pwa.zip` | Isi `dist/pwa/` dalam bentuk zip |
| `dist/warung-meong-artifact.html` | Versi untuk Claude Artifact |

### Tes

Butuh Chromium: `npx playwright install chromium`.

```bash
npm run test:smoke     # intro rumah, pilih kucing, jalan turun tangga, sarapan
npm run test:ui        # semua panel: toko, lemari, resep, piala, pengaturan, warung
npm run test:portrait  # layar portrait + joystick sentuh
npm run test:dayloop   # pilih hari, main (bot), hasil, pulang, tidur
npm run test:pwa       # audio, simpan progres, PWA tetap jalan saat offline
npm run sim            # bot main hari 1–10, untuk kalibrasi target bintang
npm run perf           # jumlah draw call dan segitiga
```

`npm run sim -- 1,2,3 3 "" kid` menjalankan bot "gaya anak" (lebih lambat, kadang salah jalan) untuk mengukur target yang realistis.

### Struktur kode

| File | Isi |
| --- | --- |
| `src/main.js` | Alur game: layar judul, intro, rumah ↔ warung, hasil hari, simpan |
| `src/game/warung.js` | Warung: stasiun masak, pelanggan, pesanan, kesabaran, koin, panah bantuan, bot |
| `src/game/house.js` | Rumah 2 lantai, tangga, intro rumah boneka, pagi/malam |
| `src/game/characters.js` | Model kucing dan hewan pelanggan, topi, animasi |
| `src/game/items.js` | Model makanan & bahan, ikon 3D untuk UI |
| `src/game/props.js` | Furnitur dan peralatan dapur |
| `src/game/data.js` | Resep, hari (target bintang), upgrade, topi, baju, piala |
| `src/engine/` | Pembuat blok, tekstur, audio sintetis, input sentuh, partikel, simpan |
| `src/ui/` | HUD, panel, dan gaya UI |
| `assets/icon.png` | Ikon aplikasi (dibuat ulang dengan `npm run icon`) |

Target bintang diatur di `src/game/data.js` (`stars: [1★, 2★, 3★]`).

## Deploy

Workflow `.github/workflows/pages.yml` membangun game dan menerbitkannya ke GitHub Pages setiap ada push ke `main`. Aktifkan sekali di **Settings › Pages › Source: GitHub Actions**.
