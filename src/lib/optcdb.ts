const OPTC_DB_BASE = 'https://2shankz.github.io/optc-db.github.io';

// Get character portrait URL (full transparent image)
// Pattern: api/images/full/transparent/{thousands}/{hundreds_of_remainder}/{id_padded}.png
// ID 1:    /0/000/0001.png  (0, floor(1%1000/100)*100=0 -> "000")
// ID 306:  /0/300/0306.png  (0, floor(306%1000/100)*100=300 -> "300")
// ID 2251: /2/200/2251.png  (2, floor(251/100)*100=200 -> "200")
// ID 3730: /3/700/3730.png  (3, floor(730/100)*100=700 -> "700")
export function getCharacterPortrait(id: number): string {
  const thousands = Math.floor(id / 1000);
  const remainder = id % 1000;
  const hundreds = Math.floor(remainder / 100) * 100;
  const hundredsPadded = String(hundreds).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/full/transparent/${thousands}/${hundredsPadded}/${idPadded}.png`;
}

// Thumbnail uses the same URL
export function getCharacterThumbnail(id: number): string {
  return getCharacterPortrait(id);
}

// For dual types like "STR/QCK", return the first type
function getPrimaryType(type: string): string {
  if (!type) return '';
  return type.split('/')[0].trim().toUpperCase();
}

// Type color mapping
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
