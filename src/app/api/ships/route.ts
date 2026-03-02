import { NextRequest, NextResponse } from 'next/server';

// Cache for ships data
let cachedShips: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function loadShips(): Promise<any[]> {
  if (cachedShips && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedShips;
  }

  try {
    const url = 'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/ships.js';
    const response = await fetch(url);
    const jsText = await response.text();

    // Format: window.ships = [...];
    const match = jsText.match(/window\.ships\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!match) {
      throw new Error('Could not parse ships.js');
    }

    const fn = new Function('return ' + match[1]);
    cachedShips = fn();
    cacheTimestamp = Date.now();
    return cachedShips!;
  } catch (e) {
    console.error('Error loading ships:', e);
    return [];
  }
}

function extractShipInfo(ship: any): any {
  if (!ship) return null;

  const result: any = {
    name: ship.name || '',
  };

  // Boost/ability info
  if (ship.boost) {
    result.boost = ship.boost;
  }

  // Special ability
  if (ship.special) {
    if (typeof ship.special === 'string') {
      result.special = ship.special;
    } else if (ship.special.description) {
      result.special = ship.special.description;
      if (ship.special.cooldown) {
        result.specialCooldown = ship.special.cooldown;
      }
    }
  }

  // Super special
  if (ship.superSpecial) {
    if (typeof ship.superSpecial === 'string') {
      result.superSpecial = ship.superSpecial;
    } else if (ship.superSpecial.description) {
      result.superSpecial = ship.superSpecial.description;
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');
  const id = request.nextUrl.searchParams.get('id');

  if (!name && !id) {
    return NextResponse.json({ error: 'Missing name or id parameter' }, { status: 400 });
  }

  try {
    const ships = await loadShips();

    if (ships.length === 0) {
      return NextResponse.json({ error: 'Ships data not available' }, { status: 503 });
    }

    let ship: any = null;

    if (id) {
      const idx = parseInt(id);
      // Ships array is 0-indexed but ship IDs start at 1
      if (idx >= 1 && idx <= ships.length) {
        ship = ships[idx - 1];
      }
    } else if (name) {
      // Search by name (case-insensitive)
      const lower = name.toLowerCase();
      ship = ships.find((s: any) => s?.name?.toLowerCase() === lower);
      if (!ship) {
        // Partial match
        ship = ships.find((s: any) => s?.name?.toLowerCase().includes(lower));
      }
    }

    if (!ship) {
      return NextResponse.json({ error: 'Ship not found', name, id }, { status: 404 });
    }

    const info = extractShipInfo(ship);
    return NextResponse.json(info);
  } catch (err) {
    console.error('Error loading ship details:', err);
    return NextResponse.json({ error: 'Failed to load ship details' }, { status: 500 });
  }
}
