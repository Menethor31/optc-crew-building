const OPTC_DB_BASE = 'https://2shankz.github.io/optc-db.github.io';

export function getCharacterThumbnail(id: number): string {
  const thousands = Math.floor(id / 1000);
  const remainder = id % 1000;
  const hundreds = Math.floor(remainder / 100) * 100;
  const hundredsPadded = String(hundreds).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/thumbnail/glo/${thousands}/${hundredsPadded}/${idPadded}.png`;
}

export function getCharacterPortrait(id: number): string {
  const thousands = Math.floor(id / 1000);
  const remainder = id % 1000;
  const hundreds = Math.floor(remainder / 100) * 100;
  const hundredsPadded = String(hundreds).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/full/transparent/${thousands}/${hundredsPadded}/${idPadded}.png`;
}

function getPrimaryType(type: string): string {
  if (!type) return '';
  return type.split('/')[0].trim().toUpperCase();
}

function getSingleTypeColor(t: string): string {
  switch (t.trim().toUpperCase()) {
    case 'STR': return '#E74C3C';
    case 'DEX': return '#2ECC71';
    case 'QCK': return '#3498DB';
    case 'PSY': return '#F1C40F';
    case 'INT': return '#9B59B6';
    default: return '#8B949E';
  }
}

export function getTypeColor(type: string): string {
  return getSingleTypeColor(getPrimaryType(type));
}

// Returns [color1, color2] for dual types, or [color1] for single
export function getTypeColors(type: string): string[] {
  if (!type) return ['#8B949E'];
  const parts = type.split('/');
  if (parts.length >= 2) {
    return [getSingleTypeColor(parts[0]), getSingleTypeColor(parts[1])];
  }
  return [getSingleTypeColor(parts[0])];
}

// Returns CSS style for border — gradient for dual types
export function getDualTypeBorderStyle(type: string): Record<string, string> {
  const colors = getTypeColors(type);
  if (colors.length >= 2) {
    return {
      border: '2px solid transparent',
      backgroundImage: `linear-gradient(#1C2333, #1C2333), linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
    };
  }
  return { borderColor: colors[0], borderWidth: '2px', borderStyle: 'solid' };
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

export interface Ship {
  id: number;
  name: string;
  thumbnail: string;
  boost?: string;
  special?: string;
  superSpecial?: string;
}

export const SHIPS: Ship[] = [
  { id: 1, name: 'Dinghy', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh1.png',
    boost: 'Boosts ATK of all characters by 1.2x and their HP by 1.2x' },
  { id: 2, name: 'Merry Go', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh2.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.3x' },
  { id: 3, name: 'Coffin Boat', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh3.png',
    boost: 'Boosts ATK of Slasher characters by 1.5x, their HP by 1.3x, reduces crew\'s HP by 10% at the end of each turn' },
  { id: 4, name: 'Miss Love Duck', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh4.png',
    boost: 'Boosts ATK of Striker characters by 1.5x and their HP by 1.3x' },
  { id: 5, name: 'Baratie', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh5.png',
    boost: 'Boosts ATK of QCK characters by 1.5x and their HP by 1.1x, recovers 500 HP at end of each turn' },
  { id: 6, name: 'Moby Dick', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh6.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.4x, cuts crew\'s HP by 50% at start of quest' },
  { id: 7, name: 'Marine Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh7.png',
    boost: 'Boosts ATK of Shooter characters by 1.5x, their HP by 1.2x, and recovers 300 HP at end of each turn' },
  { id: 8, name: 'Thousand Sunny', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh8.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.3x',
    special: 'Deals 50,000 fixed damage to all enemies (15 turns)' },
  { id: 9, name: 'Bezan Black', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh9.png',
    boost: 'Boosts ATK of QCK characters by 1.5x, their HP by 1.1x' },
  { id: 10, name: 'Aokiji Bicycle', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh10.png',
    boost: 'Boosts ATK of Striker and Free Spirit characters by 1.5x, their HP by 1.2x' },
  { id: 11, name: 'Big Top', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh11.png',
    boost: 'Boosts ATK of characters with 20 cost or less by 1.5x and their HP by 1.3x' },
  { id: 12, name: 'Striker', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh12.png',
    boost: 'Boosts ATK of Driven characters by 1.5x and their HP by 1.2x' },
  { id: 13, name: 'Red Force', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh13.png',
    boost: 'Boosts ATK of Cerebral and Free Spirit characters by 1.5x, their HP by 1.25x',
    special: 'Reduces Bind and Despair duration by 2 turns (15 turns)' },
  { id: 14, name: 'Kuja Pirate Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh14.png',
    boost: 'Boosts ATK of Free Spirit and Fighter characters by 1.5x, their HP by 1.25x, recovers 700 HP at end of each turn' },
  { id: 15, name: 'Rocketman', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh15.png',
    boost: 'Boosts ATK of Powerhouse characters by 1.55x, their HP by 1.2x, reduces crew\'s HP by 10% at the end of each turn' },
  { id: 16, name: 'Ark Maxim', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh16.png',
    boost: 'Boosts ATK of PSY and QCK characters by 1.5x, their HP by 1.2x' },
  { id: 17, name: 'Sexy Foxy', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh17.png',
    boost: 'Boosts ATK of Cerebral characters by 1.5x and their HP by 1.25x' },
  { id: 18, name: 'Thriller Bark', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh18.png',
    boost: 'Boosts ATK of Driven and Powerhouse characters by 1.5x and their HP by 1.25x' },
  { id: 19, name: 'Donquixote Pirates Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh19.png',
    boost: 'Boosts ATK of Driven characters by 1.55x and their HP by 1.25x' },
  { id: 20, name: 'Sun Pirates Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh20.png',
    boost: 'Boosts ATK of Fighter characters by 1.55x and their HP by 1.25x' },
  { id: 21, name: 'Garp\'s Warship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh21.png',
    boost: 'Reduces Powerhouse characters\' Special charge time by 1 turn at start of quest, boosts their ATK by 1.85x, cuts crew\'s HP by 30%, reduces crew\'s Paralysis duration by 1 turn, and heals HP at end of turn (more depending on number of Powerhouses in crew; up to 2500 HP)' },
  { id: 22, name: 'Polar Tang', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh22.png',
    boost: 'Boosts ATK of Slasher and Free Spirit characters by 1.5x and their HP by 1.25x',
    special: 'Reduces Bind and Despair duration by 3 turns (15 turns)' },
  { id: 23, name: 'Nostra Castello', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh23.png',
    boost: 'Boosts ATK of Driven characters by 1.56x and their HP by 1.25x, reduces crew\'s HP by 5% at end of each turn' },
  { id: 24, name: 'Zunesha', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh24.png',
    boost: 'Boosts ATK of Powerhouse and Cerebral characters by 1.55x and their HP by 1.25x, makes TND and RCV orbs beneficial for Powerhouse and Cerebral characters' },
  { id: 25, name: 'Going Luffy Senpai', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh25.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.25x, boosts EXP gained by 1.5x' },
  { id: 26, name: 'Thousand Sunny 2nd Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh26.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 27, name: 'Flying Dutchman', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh27.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.25x, boosts EXP gained by 1.5x' },
  { id: 28, name: 'Germa 66 Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh28.png',
    boost: 'Boosts ATK of Powerhouse characters by 1.55x, their HP by 1.25x, reduces Special charge time of Powerhouse characters by 1 turn at start of quest' },
  { id: 29, name: 'Thousand Sunny 3rd Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh29.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 30, name: 'Queen Mama Chanter', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh30.png',
    boost: 'Boosts ATK of Powerhouse and Cerebral characters by 1.55x and their HP by 1.3x' },
  { id: 31, name: 'Megalo', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh31.png',
    boost: 'Boosts ATK of Free Spirit and Fighter characters by 1.55x and their HP by 1.3x' },
  { id: 32, name: 'Thousand Sunny Coated', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh32.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 33, name: 'Hoe', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh33.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.25x, boosts EXP gained by 1.75x' },
  { id: 34, name: 'Karasumaru', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh34.png',
    boost: 'Boosts ATK of Free Spirit characters by 1.55x and their HP by 1.3x' },
  { id: 35, name: 'Liberal Hind', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh35.png',
    boost: 'Boosts ATK of Cerebral and Driven characters by 1.55x and their HP by 1.3x' },
  { id: 36, name: 'Thousand Sunny 4th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh36.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 37, name: 'Oro Jackson', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh37.png',
    boost: 'Boosts ATK of all characters by 1.55x, their HP by 1.3x, and makes RCV and TND orbs beneficial for all characters' },
  { id: 38, name: 'Thousand Sunny 5th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh38.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 39, name: 'Numancia Flamingo', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh39.png',
    boost: 'Boosts ATK of Slasher characters by 1.55x, their HP by 1.3x' },
  { id: 40, name: 'Piece of Spadille', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh40.png',
    boost: 'Boosts ATK of Striker and Shooter characters by 1.55x and their HP by 1.3x' },
  { id: 41, name: 'Blackbeard\'s Raft', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh41.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.3x, reduces crew\'s HP by 20% at start of quest' },
  { id: 42, name: 'Victoria Punk', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh42.png',
    boost: 'Boosts ATK of STR, DEX and QCK characters by 1.55x and their HP by 1.3x' },
  { id: 43, name: 'Thousand Sunny 6th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh43.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 44, name: 'Saber of Xebec', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh44.png',
    boost: 'Boosts ATK of all characters by 1.6x and their HP by 1.25x, reduces crew\'s HP by 10% at the end of each turn' },
  { id: 45, name: 'Thousand Sunny 7th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh45.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 46, name: 'Grand Fleet Ship', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh46.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.3x' },
  { id: 47, name: 'Thousand Sunny 8th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh47.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 48, name: 'Laboon', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh48.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.3x' },
  { id: 49, name: 'Thousand Sunny 9th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh49.png',
    boost: 'Boosts ATK of all characters by 1.5x and their HP by 1.35x' },
  { id: 50, name: 'Thousand Sunny Wano', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh50.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.3x' },
  { id: 51, name: 'Shark Superb', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh51.png',
    boost: 'Boosts ATK of Slasher and Driven characters by 1.55x and their HP by 1.3x' },
  { id: 52, name: 'Thousand Sunny 10th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh52.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.35x' },
  { id: 53, name: 'Bege Castle', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh53.png',
    boost: 'Boosts ATK of Shooter and Driven characters by 1.55x and their HP by 1.3x' },
  { id: 54, name: 'Master Catfish', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh54.png',
    boost: 'Boosts ATK of Fighter characters by 1.55x and their HP by 1.3x' },
  { id: 55, name: 'Yonta Maria', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh55.png',
    boost: 'Boosts ATK of Striker and Powerhouse characters by 1.55x and their HP by 1.3x' },
  { id: 56, name: 'Pluton', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh56.png',
    boost: 'Boosts ATK of all characters by 1.6x and their HP by 1.3x' },
  { id: 57, name: 'Thousand Sunny 11th Anni', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh57.png',
    boost: 'Boosts ATK of all characters by 1.55x and their HP by 1.35x' },
  { id: 58, name: 'Bald Parrot', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh58.png',
    boost: 'Boosts ATK of Cerebral and Free Spirit characters by 1.55x and their HP by 1.3x' },
  { id: 59, name: 'Iron Pirate Franky Shogun', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh59.png',
    boost: 'Boosts ATK of Powerhouse and Shooter characters by 1.55x and their HP by 1.3x' },
  { id: 60, name: 'Kidmaru', thumbnail: 'https://img.gamewith.jp/article_tools/onepiece/gacha/sh60.png',
    boost: 'Boosts ATK of Striker characters by 1.6x and their HP by 1.3x' },
];

export function searchShips(query: string): Ship[] {
  if (!query || query.length < 1) return SHIPS;
  const lower = query.toLowerCase();
  return SHIPS.filter(s => s.name.toLowerCase().includes(lower));
}

export function getShipByName(name: string): Ship | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  return SHIPS.find(s => s.name.toLowerCase() === lower) ||
         SHIPS.find(s => s.name.toLowerCase().includes(lower)) ||
         null;
}
