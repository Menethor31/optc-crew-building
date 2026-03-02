import { NextRequest, NextResponse } from 'next/server';

// Cache for details data
let cachedDetails: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function loadDetails(): Promise<Record<string, any>> {
  if (cachedDetails && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedDetails;
  }

  const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/details.js';
  const response = await fetch(url);
  const jsText = await response.text();

  // Extract the object from: window.details = {...}
  const match = jsText.match(/window\.details\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) {
    throw new Error('Could not parse details.js');
  }

  // Parse using Function constructor (safer than eval)
  try {
    const fn = new Function('return ' + match[1]);
    cachedDetails = fn();
    cacheTimestamp = Date.now();
    return cachedDetails!;
  } catch (e) {
    throw new Error('Failed to evaluate details data');
  }
}

function extractDetail(detail: any): any {
  if (!detail) return null;

  const result: any = {};

  // Captain ability
  if (detail.captain) {
    if (typeof detail.captain === 'string') {
      result.captain = detail.captain;
    } else if (detail.captain.base) {
      result.captain = detail.captain.base;
    } else if (detail.captain.character1 && detail.captain.character2) {
      // Dual character
      result.captain = `Character 1: ${detail.captain.character1}\nCharacter 2: ${detail.captain.character2}`;
      if (detail.captain.combined) {
        result.captain += `\nCombined: ${detail.captain.combined}`;
      }
    }
  }

  // Special
  if (detail.special) {
    if (typeof detail.special === 'string') {
      result.special = detail.special;
    } else if (Array.isArray(detail.special)) {
      // Multiple stages
      const last = detail.special[detail.special.length - 1];
      result.special = last?.description || last?.special || '';
      if (last?.cooldown) {
        result.cooldown = Array.isArray(last.cooldown) ? last.cooldown[last.cooldown.length - 1] : last.cooldown;
      }
    } else if (detail.special.description) {
      result.special = detail.special.description;
      if (detail.special.cooldown) {
        result.cooldown = Array.isArray(detail.special.cooldown)
          ? detail.special.cooldown[detail.special.cooldown.length - 1]
          : detail.special.cooldown;
      }
    } else if (detail.special.character1 && detail.special.character2) {
      // Dual character special
      result.special = `Character 1: ${detail.special.character1.description || detail.special.character1}\nCharacter 2: ${detail.special.character2.description || detail.special.character2}`;
      const cd1 = detail.special.character1?.cooldown;
      const cd2 = detail.special.character2?.cooldown;
      if (cd1) result.cooldown = Array.isArray(cd1) ? cd1[cd1.length - 1] : cd1;
    }
  }

  // Cooldown from top-level if not found
  if (!result.cooldown && detail.cooldown) {
    result.cooldown = Array.isArray(detail.cooldown)
      ? detail.cooldown[detail.cooldown.length - 1]
      : detail.cooldown;
  }

  // Special name
  if (detail.specialName) {
    result.specialName = detail.specialName;
  }

  // Sailor
  if (detail.sailor) {
    if (typeof detail.sailor === 'string') {
      result.sailor = detail.sailor;
    } else if (detail.sailor.base) {
      result.sailor = detail.sailor.base;
    } else if (detail.sailor.character1) {
      result.sailor = `Char 1: ${detail.sailor.character1}\nChar 2: ${detail.sailor.character2 || ''}`;
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const details = await loadDetails();
    const detail = details[id];
    if (!detail) {
      return NextResponse.json({ error: 'Character not found', id }, { status: 404 });
    }
    const extracted = extractDetail(detail);
    return NextResponse.json({ id, ...extracted });
  } catch (err) {
    console.error('Error loading details:', err);
    return NextResponse.json({ error: 'Failed to load character details' }, { status: 500 });
  }
}
