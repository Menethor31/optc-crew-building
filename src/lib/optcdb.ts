const OPTC_DB_BASE = 'https://2shankz.github.io/optc-db.github.io';

// Get character portrait URL (full transparent image)
// Format: api/images/full/transparent/{thousands}/{thousands_padded}/{id_padded}.png
// Example ID 1:    api/images/full/transparent/0/000/0001.png
// Example ID 2251: api/images/full/transparent/2/002/2251.png
export function getCharacterPortrait(id: number): string {
  const thousands = Math.floor(id / 1000);
  const thousandsPadded = String(thousands).padStart(3, '0');
  const idPadded = String(id).padStart(4, '0');
  return `${OPTC_DB_BASE}/api/images/full/transparent/${thousands}/${thousandsPadded}/${idPadded}.png`;
}

// Thumbnail uses the same URL (no separate thumbnail endpoint found)
export function getCharacterThumbnail(id: number): string {
  return getCharacterPortrait(id);
}

// Type color mapping
export function getTypeColor(type: string): string {
  switch (type?.toUpperCase()) {
    case 'STR': return '#E74C3C';
    case 'DEX': return '#2ECC71';
    case 'QCK': return '#3498DB';
    case 'PSY': return '#F1C40F';
    case 'INT': return '#9B59B6';
    default: return '#8B949E';
  }
}

export function getTypeBgClass(type: string): string {
  switch (type?.toUpperCase()) {
    case 'STR': return 'border-str bg-str/20';
    case 'DEX': return 'border-dex bg-dex/20';
    case 'QCK': return 'border-qck bg-qck/20';
    case 'PSY': return 'border-psy bg-psy/20';
    case 'INT': return 'border-int bg-int/20';
    default: return 'border-optc-border bg-optc-bg-hover';
  }
}
