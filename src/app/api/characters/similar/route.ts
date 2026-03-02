import { NextRequest, NextResponse } from 'next/server';

// Reuse cached data from details route
let cachedDetails: Record<string, any> | null = null;
let cachedUnits: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function loadDetails(): Promise<Record<string, any>> {
  if (cachedDetails && Date.now() - cacheTimestamp < CACHE_DURATION) return cachedDetails;
  const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/details.js';
  const response = await fetch(url);
  const jsText = await response.text();
  const match = jsText.match(/window\.details\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) throw new Error('Could not parse details.js');
  const fn = new Function('return ' + match[1]);
  cachedDetails = fn();
  cacheTimestamp = Date.now();
  return cachedDetails!;
}

async function loadUnits(): Promise<Record<string, any>> {
  if (cachedUnits) return cachedUnits;
  const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/units.js';
  const response = await fetch(url);
  const jsText = await response.text();
  const match = jsText.match(/window\.units\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error('Could not parse units.js');
  cachedUnits = JSON.parse(match[1]);
  return cachedUnits!;
}

// Extract special text from detail object
function getSpecialText(detail: any): string {
  if (!detail?.special) return '';
  if (typeof detail.special === 'string') return detail.special;
  if (Array.isArray(detail.special)) {
    const last = detail.special[detail.special.length - 1];
    return last?.description || last?.special || '';
  }
  if (detail.special.description) return detail.special.description;
  if (detail.special.character1) {
    const c1 = detail.special.character1.description || detail.special.character1 || '';
    const c2 = detail.special.character2?.description || detail.special.character2 || '';
    return `${c1} ${c2}`;
  }
  return '';
}

// Define effect categories with keywords
const EFFECT_CATEGORIES: Record<string, RegExp[]> = {
  'atk_boost': [/boosts?\s+(the\s+)?atk/i, /atk\s+of\s+.*by\s+[\d.]+x/i],
  'orb_boost': [/boosts?\s+(the\s+)?effect\s+of\s+orbs/i, /orb\s+effects?\s+by/i],
  'chain_boost': [/chain\s+(multiplier|coefficient|boundary|bonus)/i, /locks?\s+the\s+chain/i, /adds?\s+[\d.]+x?\s+to\s+chain/i],
  'orb_change': [/changes?\s+.*orbs?\s+(into|to)\s+matching/i, /changes?\s+.*orbs?\s+(into|to)\s+\[/i, /changes?\s+\[.*\]\s+(and\s+\[.*\]\s+)?orbs/i],
  'block_removal': [/\[block\]/i, /changes?\s+\[block\]/i],
  'fixed_damage': [/fixed\s+damage/i, /deals?\s+[\d,.]+\s+fixed/i],
  'typeless_damage': [/typeless\s+damage/i],
  'aoe_damage': [/damage\s+to\s+all\s+enemies/i, /all\s+enemies/i],
  'single_damage': [/damage\s+to\s+one\s+enemy/i, /one\s+enemy/i],
  'hp_cut': [/cuts?\s+(the\s+)?current\s+hp/i, /reduces?\s+(the\s+)?current\s+hp/i],
  'healing': [/recovers?\s+.*hp/i, /heals?\s+.*hp/i, /restores?\s+.*hp/i],
  'damage_reduction': [/reduces?\s+(any\s+)?damage\s+(received|taken)/i, /damage\s+reduction/i],
  'bind_removal': [/reduces?\s+(bind|blindness|paralysis)/i, /removes?\s+bind/i],
  'despair_removal': [/reduces?\s+despair/i, /removes?\s+despair/i],
  'silence_removal': [/reduces?\s+silence/i, /removes?\s+silence/i, /reduces?\s+special\s+rewind/i],
  'delay': [/delays?\s+(all\s+)?enemies/i],
  'def_reduction': [/reduces?\s+(the\s+)?defense/i, /defense\s+.*zero/i, /reduces?\s+enemies.*defense/i],
  'conditional_boost': [/boosts?\s+atk\s+against/i, /conditional/i],
  'affinity_boost': [/color\s+affinity/i, /type\s+affinity/i],
  'eot_damage': [/end\s+of\s+(each\s+)?turn/i, /additional\s+.*damage\s+.*turn/i],
  'barrier_pen': [/barrier\s+penetration/i, /ignor(e|ing)\s+barriers?/i],
  'super_type': [/super\s+type/i],
  'slot_seal': [/slot\s+seal/i, /slot\s+bind/i],
  'swap': [/swaps?\s+this\s+character/i],
};

// Extract effects from special text
function extractEffects(specialText: string): Set<string> {
  const effects = new Set<string>();
  const text = specialText.toLowerCase();
  for (const [effect, patterns] of Object.entries(EFFECT_CATEGORIES)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        effects.add(effect);
        break;
      }
    }
  }
  return effects;
}

// Calculate similarity score between two effect sets
function similarityScore(effects1: Set<string>, effects2: Set<string>): number {
  if (effects1.size === 0 || effects2.size === 0) return 0;
  let intersection = 0;
  const arr1 = Array.from(effects1);
  for (let i = 0; i < arr1.length; i++) {
    if (effects2.has(arr1[i])) intersection++;
  }
  // Jaccard similarity
  const unionSet = new Set(arr1.concat(Array.from(effects2)));
  return unionSet.size > 0 ? intersection / unionSet.size : 0;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(parseInt(limitParam || '8'), 20);

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const [details, units] = await Promise.all([loadDetails(), loadUnits()]);
    const sourceDetail = details[id];
    if (!sourceDetail) {
      return NextResponse.json({ error: 'Character not found', id, similar: [] }, { status: 404 });
    }

    const sourceSpecial = getSpecialText(sourceDetail);
    if (!sourceSpecial) {
      return NextResponse.json({ id, similar: [], message: 'No special found' });
    }

    const sourceEffects = extractEffects(sourceSpecial);
    if (sourceEffects.size === 0) {
      return NextResponse.json({ id, similar: [], effects: [], message: 'No matchable effects' });
    }

    // Score all other characters
    const scores: { id: string; score: number; name: string; type: string; stars: number; effects: string[] }[] = [];

    for (const [charId, detail] of Object.entries(details)) {
      if (charId === id) continue;
      const special = getSpecialText(detail);
      if (!special) continue;

      const charEffects = extractEffects(special);
      const score = similarityScore(sourceEffects, charEffects);

      if (score >= 0.3) { // At least 30% similarity
        const unit = units[charId];
        const stars = unit ? (parseInt(unit.stars) || 0) : 0;
        // Prioritize higher rarity characters
        const adjustedScore = score + (stars >= 5 ? 0.05 : 0);

        scores.push({
          id: charId,
          score: adjustedScore,
          name: unit?.name || `Unit #${charId}`,
          type: unit ? (Array.isArray(unit.type) ? unit.type.join('/') : (unit.type || '')) : '',
          stars,
          effects: Array.from(charEffects).filter(e => sourceEffects.has(e)),
        });
      }
    }

    // Sort by score descending, then by stars
    scores.sort((a, b) => b.score - a.score || b.stars - a.stars);
    const similar = scores.slice(0, limit);

    return NextResponse.json({
      id,
      sourceEffects: Array.from(sourceEffects),
      similar,
    });
  } catch (err) {
    console.error('Error finding similar characters:', err);
    return NextResponse.json({ error: 'Failed to find similar characters', similar: [] }, { status: 500 });
  }
}
