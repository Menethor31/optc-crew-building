import { NextResponse } from 'next/server';

// Cache the parsed data in memory (server-side)
let cachedData: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  try {
    // Check cache
    if (!cachedData || Date.now() - cacheTimestamp > CACHE_DURATION) {
      // Fetch the units.js file from OPTC DB (2Shankz fork)
      const res = await fetch(
        'https://raw.githubusercontent.com/2Shankz/optc-db.github.io/master/common/data/units.js'
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch OPTC DB: ${res.status}`);
      }

      const jsText = await res.text();

      // The file format is: window.units = { "1": {...}, "2": {...}, ... };
      // Extract the object part after "window.units = "
      const match = jsText.match(/window\.units\s*=\s*(\{[\s\S]*\});?\s*$/);
      if (!match) {
        throw new Error('Could not parse units.js format');
      }

      // Parse the JSON object
      const unitsObject = JSON.parse(match[1]);

      // Transform object to array
      // Each entry: {"id":"1","name":"Monkey D. Luffy","type":"STR","class":"Fighter","stars":"2",...}
      cachedData = Object.values(unitsObject).map((unit: any) => {
        // Handle class: can be string, array of strings, or array of arrays (dual char)
        let classStr = 'Unknown';
        if (unit.class) {
          if (typeof unit.class === 'string') {
            classStr = unit.class;
          } else if (Array.isArray(unit.class)) {
            // Check if it's array of arrays (dual character)
            if (Array.isArray(unit.class[0])) {
              classStr = 'Dual: ' + unit.class.map((c: any) => Array.isArray(c) ? c.join('/') : c).join(' & ');
            } else {
              classStr = unit.class.join('/');
            }
          }
        }
        return {
          id: parseInt(unit.id) || 0,
          name: unit.name || '',
          type: Array.isArray(unit.type) ? unit.type.join('/') : (unit.type || 'Unknown'),
          class: classStr,
          stars: parseInt(unit.stars) || 0,
        };
      });

      cacheTimestamp = Date.now();
      console.log(`OPTC DB loaded: ${cachedData.length} characters`);
    }

    // If no query, return empty (don't send 3000+ characters)
    if (!query || query.length < 2) {
      return NextResponse.json({ characters: [], total: cachedData!.length });
    }

    // Search and filter
    const isIdSearch = /^\d+$/.test(query);
    const results = cachedData!
      .filter((c: any) => {
        if (isIdSearch) return String(c.id).includes(query);
        return c.name && c.name.toLowerCase().includes(query);
      })
      .sort((a: any, b: any) => {
        // Prioritize exact starts
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        // Then by stars (higher first)
        return (b.stars || 0) - (a.stars || 0);
      })
      .slice(0, limit);

    return NextResponse.json({ characters: results, total: cachedData!.length });
  } catch (error) {
    console.error('Error fetching OPTC DB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character data', details: String(error), characters: [] },
      { status: 500 }
    );
  }
}
