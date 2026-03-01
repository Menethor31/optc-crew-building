const OPTC_DB_BASE = 'https://2shankz.github.io/optc-db.github.io';

// Thumbnail (small, fast loading)
// Format: api/images/thumbnail/glo/{thousands}/{hundreds_padded}/{id_padded}.png
// ID 1:    /0/000/0001.png
// ID 2251: /2/200/2251.png
export function getCharacterThumbnail(id: number): string {
  const thousands = Math.floor(id / 1000);
  const remainder = id % 1000;
  const hundreds = Math.floor(remainder / 100) * 100;
  const hundredsPadded = String(hundreds).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/thumbnail/glo/${thousands}/${hundredsPadded}/${idPadded}.png`;
}

// Full portrait (large, for detail pages)
export function getCharacterPortrait(id: number): string {
  const thousands = Math.floor(id / 1000);
  const remainder = id % 1000;
  const hundreds = Math.floor(remainder / 100) * 100;
  const hundredsPadded = String(hundreds).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/full/transparent/${thousands}/${hundredsPadded}/${idPadded}.png`;
}

// For dual types like "STR/QCK", return the first type
function getPrimaryType(type: string): string {
  if (!type) return '';
  return type.split('/')[0].trim().toUpperCase();
}

export function getTypeColor(type: string): string {
  switch (getPrimaryType(type)) {
    case 'STR': return '#E74C3C';
    case 'DEX': return '#2ECC71';
    case 'QCK': return '#3498DB';
    case 'PSY': return '#F1C40F';
    case 'INT': return '#9B59B6';
    default: return '#8B949E';
  }
}

export function getTypeBgClass(type: string): string {
  switch (getPrimaryType(type)) {
    case 'STR': return 'border-red-500 bg-red-500/20';
    case 'DEX': return 'border-green-500 bg-green-500/20';
    case 'QCK': return 'border-blue-500 bg-blue-500/20';
    case 'PSY': return 'border-yellow-500 bg-yellow-500/20';
    case 'INT': return 'border-purple-500 bg-purple-500/20';
    default: return 'border-optc-border bg-optc-bg-hover';
  }
}

// Ships data with gamewith thumbnails
export interface Ship {
  id: number;
  name: string;
  thumbnail: string;
}

export const SHIPS: Ship[] = [
  { id: 1, name: 'Dinghy', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh1.png' },
  { id: 2, name: 'Merry Go', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh2.png' },
  { id: 3, name: 'Coffin Boat', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh3.png' },
  { id: 4, name: 'Miss Love Duck', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh4.png' },
  { id: 5, name: 'Baratie', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh5.png' },
  { id: 6, name: 'Moby Dick', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh6.png' },
  { id: 7, name: 'Marine Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh7.png' },
  { id: 8, name: 'Thousand Sunny', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh8.png' },
  { id: 9, name: 'Bezan Black', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh9.png' },
  { id: 10, name: 'Aokiji Bicycle', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh10.png' },
  { id: 11, name: 'Big Top', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh11.png' },
  { id: 12, name: 'Striker', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh12.png' },
  { id: 13, name: 'Red Force', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh13.png' },
  { id: 14, name: 'Kuja Pirate Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh14.png' },
  { id: 15, name: 'Rocketman', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh15.png' },
  { id: 16, name: 'Ark Maxim', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh16.png' },
  { id: 17, name: 'Sexy Foxy', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh17.png' },
  { id: 18, name: 'Thriller Bark', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh18.png' },
  { id: 19, name: 'Donquixote Pirates Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh19.png' },
  { id: 20, name: 'Sun Pirates Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh20.png' },
  { id: 21, name: 'Garp\'s Warship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh21.png' },
  { id: 22, name: 'Polar Tang', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh22.png' },
  { id: 23, name: 'Nostra Castello', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh23.png' },
  { id: 24, name: 'Zunesha', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh24.png' },
  { id: 25, name: 'Going Luffy Senpai', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh25.png' },
  { id: 26, name: 'Thousand Sunny 2nd Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh26.png' },
  { id: 27, name: 'Flying Dutchman', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh27.png' },
  { id: 28, name: 'Germa 66 Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh28.png' },
  { id: 29, name: 'Thousand Sunny 3rd Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh29.png' },
  { id: 30, name: 'Queen Mama Chanter', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh30.png' },
  { id: 31, name: 'Megalo', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh31.png' },
  { id: 32, name: 'Thousand Sunny Coated', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh32.png' },
  { id: 33, name: 'Hoe', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh33.png' },
  { id: 34, name: 'Karasumaru', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh34.png' },
  { id: 35, name: 'Liberal Hind', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh35.png' },
  { id: 36, name: 'Thousand Sunny 4th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh36.png' },
  { id: 37, name: 'Oro Jackson', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh37.png' },
  { id: 38, name: 'Thousand Sunny 5th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh38.png' },
  { id: 39, name: 'Numancia Flamingo', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh39.png' },
  { id: 40, name: 'Piece of Spadille', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh40.png' },
  { id: 41, name: 'Blackbeard\'s Raft', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh41.png' },
  { id: 42, name: 'Victoria Punk', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh42.png' },
  { id: 43, name: 'Thousand Sunny 6th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh43.png' },
  { id: 44, name: 'Saber of Xebec', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh44.png' },
  { id: 45, name: 'Thousand Sunny 7th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh45.png' },
  { id: 46, name: 'Grand Fleet Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh46.png' },
  { id: 47, name: 'Thousand Sunny 8th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh47.png' },
  { id: 48, name: 'Laboon', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh48.png' },
  { id: 49, name: 'Thousand Sunny 9th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh49.png' },
  { id: 50, name: 'Thousand Sunny Wano', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh50.png' },
  { id: 51, name: 'Shark Superb', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh51.png' },
  { id: 52, name: 'Thousand Sunny 10th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh52.png' },
  { id: 53, name: 'Bege Castle', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh53.png' },
  { id: 54, name: 'Master Catfish', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh54.png' },
  { id: 55, name: 'Yonta Maria', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh55.png' },
  { id: 56, name: 'Pluton', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh56.png' },
  { id: 57, name: 'Thousand Sunny 11th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh57.png' },
  { id: 58, name: 'Bald Parrot', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh58.png' },
  { id: 59, name: 'Iron Pirate Franky Shogun', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh59.png' },
  { id: 60, name: 'Kidmaru', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh60.png' },
];

export function searchShips(query: string): Ship[] {
  if (!query || query.length < 1) return SHIPS;
  const lower = query.toLowerCase();
  return SHIPS.filter(s => s.name.toLowerCase().includes(lower));
}
