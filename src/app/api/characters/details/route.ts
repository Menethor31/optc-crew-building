import { NextRequest, NextResponse } from 'next/server';

// Cache for details data
let cachedDetails: Record<string, any> | null = null;
let cachedUnits: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function loadDetails(): Promise<Record<string, any>> {
  if (cachedDetails && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedDetails;
  }

  const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/details.js';
  const response = await fetch(url);
  const jsText = await response.text();

  const match = jsText.match(/window\.details\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) {
    throw new Error('Could not parse details.js');
  }

  try {
    const fn = new Function('return ' + match[1]);
    cachedDetails = fn();
    cacheTimestamp = Date.now();
    return cachedDetails!;
  } catch (e) {
    throw new Error('Failed to evaluate details data');
  }
}

async function loadUnits(): Promise<Record<string, any>> {
  if (cachedUnits) return cachedUnits;

  const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/units.js';
  const response = await fetch(url);
  const jsText = await response.text();

  const match = jsText.match(/window\.units\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) {
    throw new Error('Could not parse units.js');
  }

  try {
    cachedUnits = JSON.parse(match[1]);
    return cachedUnits!;
  } catch (e) {
    throw new Error('Failed to parse units data');
  }
}

function extractBasicInfo(unit: any): any {
  if (!unit) return {};
  let classStr = 'Unknown';
  if (unit.class) {
    if (typeof unit.class === 'string') {
      classStr = unit.class;
    } else if (Array.isArray(unit.class)) {
      if (Array.isArray(unit.class[0])) {
        classStr = 'Dual: ' + unit.class.map((c: any) => Array.isArray(c) ? c.join('/') : c).join(' & ');
      } else {
        classStr = unit.class.join('/');
      }
    }
  }
  return {
    name: unit.name || '',
    type: Array.isArray(unit.type) ? unit.type.join('/') : (unit.type || 'Unknown'),
    class: classStr,
    stars: parseInt(unit.stars) || 0,
  };
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
      result.special = `Character 1: ${detail.special.character1.description || detail.special.character1}\nCharacter 2: ${detail.special.character2.description || detail.special.character2}`;
      const cd1 = detail.special.character1?.cooldown;
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

  // Support ability
  if (detail.support) {
    try {
      if (Array.isArray(detail.support)) {
        const supportEntries: string[] = [];
        for (let i = 0; i < detail.support.length; i++) {
          const s = detail.support[i];
          let chars = '';
          let text = '';

          // Characters supported
          if (s.Characters) {
            chars = typeof s.Characters === 'string' ? s.Characters : String(s.Characters);
          }

          // Support text - get highest level (usually key 4 or 5)
          if (s.Text) {
            if (typeof s.Text === 'string') {
              text = s.Text;
            } else {
              // Object with level keys: try 5, 4, 3, 2, 1, 0
              const levels = [5, 4, 3, 2, 1, 0];
              for (let l = 0; l < levels.length; l++) {
                if (s.Text[levels[l]]) {
                  text = s.Text[levels[l]];
                  break;
                }
              }
            }
          }

          if (chars && text) {
            supportEntries.push(`Supported: ${chars}\nLevel 5: ${text}`);
          } else if (text) {
            supportEntries.push(text);
          }
        }
        if (supportEntries.length > 0) {
          result.support = supportEntries.join('\n\n');
        }
      }
    } catch (e) {
      // Ignore parse errors for support
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
    const [details, units] = await Promise.all([loadDetails(), loadUnits()]);
    const detail = details[id];
    const unit = units[id];

    // Get basic info from units data
    const basicInfo = extractBasicInfo(unit);

    if (!detail && !unit) {
      return NextResponse.json({ error: 'Character not found', id }, { status: 404 });
    }

    const extracted = detail ? extractDetail(detail) : {};
    return NextResponse.json({ id, ...basicInfo, ...extracted });
  } catch (err) {
    console.error('Error loading details:', err);
    return NextResponse.json({ error: 'Failed to load character details' }, { status: 500 });
  }
}
