// All game content data (Indonesian text for an 8-year-old)

export const INGREDIENTS = {
  nasi: { name: 'Nasi', from: 'Rice Cooker' },
  telur: { name: 'Telur', from: 'Keranjang Telur' },
  mie: { name: 'Mie', from: 'Kotak Mie' },
  pisang: { name: 'Pisang', from: 'Gantungan Pisang' },
  bakso: { name: 'Bola Bakso', from: 'Kotak Bakso' },
  ayam: { name: 'Tusuk Ayam', from: 'Kotak Ayam' },
  jeruk: { name: 'Jeruk', from: 'Keranjang Jeruk' },
};

export const STATIONS = {
  wajan: { name: 'Wajan', verb: 'Aduk', burns: true },
  bakar: { name: 'Panggangan', verb: 'Kipas', burns: true },
  panci: { name: 'Panci', verb: 'Aduk', burns: false },
  teh: { name: 'Dispenser Teh', verb: 'Tuang', burns: false },
  jus: { name: 'Blender', verb: 'Blender', burns: false },
};

export const RECIPES = {
  esteh: { name: 'Es Teh', station: 'teh', ing: [], time: 3, price: 6, unlock: 1, drink: true },
  nasgor: { name: 'Nasi Goreng', station: 'wajan', ing: ['nasi', 'telur'], time: 6, price: 15, unlock: 2 },
  esjeruk: { name: 'Es Jeruk', station: 'jus', ing: ['jeruk'], time: 4, price: 9, unlock: 3, drink: true },
  sate: { name: 'Sate Ayam', station: 'bakar', ing: ['ayam'], time: 7, price: 16, unlock: 4 },
  miegor: { name: 'Mie Goreng', station: 'wajan', ing: ['mie', 'telur'], time: 6, price: 15, unlock: 5 },
  bakso: { name: 'Bakso', station: 'panci', ing: ['bakso', 'mie'], time: 7, price: 17, unlock: 6 },
  pisgor: { name: 'Pisang Goreng', station: 'wajan', ing: ['pisang'], time: 5, price: 11, unlock: 7 },
};
export const RECIPE_ORDER = ['esteh', 'nasgor', 'esjeruk', 'sate', 'miegor', 'bakso', 'pisgor'];

// stars: coins needed for 1/2/3 stars (calibrated with bot runs)
export const DAYS = [
  { n: 1, title: 'Hari Pertama', dur: 80, gap: [9, 12], pat: 75, two: 0, stars: [35, 65, 85] },
  { n: 2, title: 'Nasi Goreng!', dur: 100, gap: [10, 13], pat: 70, two: 0, stars: [70, 130, 175] },
  { n: 3, title: 'Segarnya Es Jeruk', dur: 110, gap: [9, 12], pat: 66, two: 0.25, stars: [80, 150, 210] },
  { n: 4, title: 'Asap Sate', dur: 120, gap: [9, 12], pat: 64, two: 0.3, dirty: true, stars: [90, 160, 250] },
  { n: 5, title: 'Mie Goreng Spesial', dur: 130, gap: [8, 11], pat: 62, two: 0.35, dirty: true, stars: [100, 185, 300] },
  { n: 6, title: 'Bakso Hangat', dur: 140, gap: [8, 11], pat: 60, two: 0.4, dirty: true, stars: [100, 190, 350] },
  { n: 7, title: 'Pisang Goreng Krispi', dur: 150, gap: [7, 10], pat: 58, two: 0.45, dirty: true, stars: [110, 210, 360] },
  { n: 8, title: 'Tamu VIP', dur: 150, gap: [7, 10], pat: 56, two: 0.5, dirty: true, vip: 0.3, stars: [120, 230, 400] },
  { n: 9, title: 'Jam Sibuk', dur: 160, gap: [6, 9], pat: 54, two: 0.5, dirty: true, vip: 0.15, stars: [130, 250, 410] },
  { n: 10, title: 'Festival Kuliner', dur: 170, gap: [6, 9], pat: 54, two: 0.5, dirty: true, vip: 0.15, juri: true, stars: [150, 300, 500] },
];
export const FREE_DAY = { n: 0, title: 'Hari Bebas', dur: 150, gap: [6, 9], pat: 56, two: 0.5, dirty: true, vip: 0.15, stars: [130, 260, 450] };
export const LAST_DAY = DAYS.length;

export function dayConfig(n) {
  if (n >= 1 && n <= DAYS.length) return DAYS[n - 1];
  return { ...FREE_DAY, n };
}
export function menuForDay(n) {
  const d = n > DAYS.length ? 99 : n;
  return RECIPE_ORDER.filter(id => RECIPES[id].unlock <= d);
}
export function newRecipeOnDay(n) {
  return RECIPE_ORDER.find(id => RECIPES[id].unlock === n) || null;
}

export const CUSTOMERS = [
  { kind: 'anjing', name: 'Anjing' },
  { kind: 'kelinci', name: 'Kelinci' },
  { kind: 'panda', name: 'Panda' },
  { kind: 'beruang', name: 'Beruang' },
  { kind: 'bebek', name: 'Bebek' },
  { kind: 'babi', name: 'Babi' },
  { kind: 'monyet', name: 'Monyet' },
  { kind: 'katak', name: 'Katak' },
  { kind: 'rubah', name: 'Rubah' },
];
export const VIP = { kind: 'singa', name: 'Pak Singa' };
export const JURI = { kind: 'pinguin', name: 'Juri Pinguin' };

export const UPGRADES = [
  { id: 'sepatu', name: 'Sepatu Lari', desc: 'Jalan lebih cepat', price: 60, day: 1 },
  { id: 'radio', name: 'Radio', desc: 'Pelanggan lebih sabar', price: 90, day: 1 },
  { id: 'wajan2', name: 'Wajan Kedua', desc: 'Bisa goreng 2 menu sekaligus', price: 120, day: 2 },
  { id: 'antigosong', name: 'Wajan Anti Gosong', desc: 'Masakan lama gosongnya', price: 90, day: 2 },
  { id: 'tanaman', name: 'Tanaman Hias', desc: 'Tip lebih banyak', price: 80, day: 2 },
  { id: 'turbo', name: 'Kompor Turbo', desc: 'Masak lebih cepat', price: 150, day: 3 },
  { id: 'meja4', name: 'Meja Tambahan', desc: 'Pelanggan lebih banyak', price: 180, day: 3 },
  { id: 'bakar2', name: 'Panggangan Kedua', desc: 'Bakar 2 sate sekaligus', price: 130, day: 4 },
  { id: 'kipas', name: 'Kipas Angin', desc: 'Pelanggan lebih sabar', price: 130, day: 4 },
  { id: 'lampu', name: 'Lampu Hias', desc: 'Tip lebih banyak', price: 110, day: 5 },
];

export const HATS = [
  { id: 'none', name: 'Tanpa Topi', price: 0 },
  { id: 'koki', name: 'Topi Koki', price: 0 },
  { id: 'pita', name: 'Pita Besar', price: 40 },
  { id: 'topi', name: 'Topi Bisbol', price: 50 },
  { id: 'baret', name: 'Baret', price: 60 },
  { id: 'bunga', name: 'Mahkota Bunga', price: 70 },
  { id: 'pesta', name: 'Topi Pesta', price: 80 },
  { id: 'kacamata', name: 'Kacamata Keren', price: 90 },
  { id: 'mahkota', name: 'Mahkota Raja', price: 220 },
];

export const OUTFITS = [
  { id: 'biru', name: 'Biru', color: '#3d8bfd', price: 0 },
  { id: 'pink', name: 'Pink', color: '#ff7eb6', price: 0 },
  { id: 'merah', name: 'Merah', color: '#ef476f', price: 25 },
  { id: 'hijau', name: 'Hijau', color: '#2ec27e', price: 25 },
  { id: 'kuning', name: 'Kuning', color: '#ffc93c', price: 25 },
  { id: 'ungu', name: 'Ungu', color: '#9b6dff', price: 30 },
  { id: 'oranye', name: 'Oranye', color: '#ff8c42', price: 30 },
  { id: 'hitam', name: 'Hitam', color: '#3a3a48', price: 35 },
];

export const FURS = [
  { id: 'oranye', name: 'Oranye' },
  { id: 'abu', name: 'Abu-abu' },
  { id: 'putih', name: 'Putih' },
  { id: 'hitam', name: 'Hitam' },
  { id: 'belang', name: 'Belang Tiga' },
  { id: 'siam', name: 'Siam' },
];

export const TROPHIES = [
  { id: 'pemula', name: 'Koki Pemula', desc: 'Selesaikan Hari 1', color: '#cd7f32' },
  { id: 'combo5', name: 'Pelayan Kilat', desc: 'Dapat combo 5', color: '#c0c0c0' },
  { id: 'sabar', name: 'Semua Senang', desc: 'Satu hari tanpa pelanggan marah (min. 6 pelanggan)', color: '#c0c0c0' },
  { id: 'sate', name: 'Raja Sate', desc: 'Sajikan 25 Sate Ayam', color: '#c0c0c0' },
  { id: 'bintang3', name: 'Bintang Tiga', desc: 'Dapat 3 bintang di satu hari', color: '#ffd23f' },
  { id: 'juragan', name: 'Juragan Koin', desc: 'Kumpulkan total 1000 koin', color: '#ffd23f' },
  { id: 'gaya', name: 'Kucing Gaya', desc: 'Punya 4 topi', color: '#c0c0c0' },
  { id: 'hebat', name: 'Koki Hebat', desc: 'Selesaikan Hari 10', color: '#ffd23f' },
];

export const DEFAULT_NAMES = { m: 'Oyen', f: 'Mimi' };
