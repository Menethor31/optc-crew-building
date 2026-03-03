'use client';

import { useState, useCallback } from 'react';
import { getCharacterThumbnail, getTypeColor } from '@/lib/optcdb';

interface SimilarChar {
  id: string;
  name: string;
  type: string;
  stars: number;
  score: number;
  effects: string[];
}

interface SimilarCharactersProps {
  unitId: number;
}

const EFFECT_LABELS: Record<string, string> = {
  'atk_boost': 'ATK Boost',
  'orb_boost': 'Orb Boost',
  'chain_boost': 'Chain Boost',
  'orb_change': 'Orb Change',
  'block_removal': 'BLOCK Removal',
  'fixed_damage': 'Fixed Damage',
  'typeless_damage': 'Typeless DMG',
  'aoe_damage': 'AoE Damage',
  'single_damage': 'Single Target',
  'hp_cut': 'HP Cut',
  'healing': 'Healing',
  'damage_reduction': 'DMG Reduction',
  'bind_removal': 'Bind Removal',
  'despair_removal': 'Despair Removal',
  'silence_removal': 'Silence Removal',
  'delay': 'Delay',
  'def_reduction': 'DEF Down',
  'conditional_boost': 'Conditional',
  'affinity_boost': 'Affinity Boost',
  'eot_damage': 'EoT Damage',
  'barrier_pen': 'Barrier Pen.',
  'super_type': 'Super Type',
  'slot_seal': 'Slot Seal',
  'swap': 'Swap',
};

export default function SimilarCharacters({ unitId }: SimilarCharactersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<SimilarChar[]>([]);
  const [sourceEffects, setSourceEffects] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  async function handleOpen() {
    setIsOpen(true);
    if (allResults.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/similar?id=${unitId}&limit=30`);
      const data = await res.json();
      if (data.similar) setAllResults(data.similar);
      if (data.sourceEffects) {
        setSourceEffects(data.sourceEffects);
        // All effects active by default
        setActiveFilters(new Set(data.sourceEffects as string[]));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const toggleFilter = useCallback((effect: string) => {
    setActiveFilters(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(effect)) {
        next.delete(effect);
      } else {
        next.add(effect);
      }
      return next;
    });
  }, []);

  // Filter and re-score based on active filters
  const filtered = allResults
    .map(char => {
      if (activeFilters.size === 0) return { ...char, filteredScore: 0 };
      // Count how many of the ACTIVE filters this character matches
      const activeArr = Array.from(activeFilters);
      let matched = 0;
      for (let i = 0; i < activeArr.length; i++) {
        if (char.effects.indexOf(activeArr[i]) >= 0) matched++;
      }
      const filteredScore = activeArr.length > 0 ? matched / activeArr.length : 0;
      return { ...char, filteredScore, matchedCount: matched };
    })
    .filter(c => c.filteredScore > 0)
    .sort((a, b) => b.filteredScore - a.filteredScore || b.stars - a.stars)
    .slice(0, 12);

  function handleImgError(id: number) { setImgErrors(prev => new Set(prev).add(id)); }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-optc-accent hover:bg-optc-accent-hover text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-md transition-colors"
        title="Find similar characters"
      >
        ↔
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-optc-border">
              <div className="flex-1 min-w-0">
                <h3 className="text-optc-text font-bold text-sm">Similar Characters</h3>
                <p className="text-optc-text-secondary text-[10px] mt-1">Tap tags to filter by effect</p>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="text-optc-text-secondary hover:text-optc-text p-1 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Effect filter tags */}
            {sourceEffects.length > 0 && (
              <div className="px-4 py-2 border-b border-optc-border/50 bg-optc-bg-hover/30">
                <div className="flex flex-wrap gap-1.5">
                  {sourceEffects.map(e => {
                    const isActive = activeFilters.has(e);
                    return (
                      <button key={e}
                        onClick={() => toggleFilter(e)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium transition-all ${
                          isActive
                            ? 'bg-optc-accent text-white shadow-sm'
                            : 'bg-optc-bg-hover text-optc-text-secondary hover:text-optc-text border border-optc-border/50'
                        }`}>
                        {EFFECT_LABELS[e] || e}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="py-12 text-center text-optc-text-secondary text-sm">
                  {activeFilters.size === 0 ? 'Select at least one effect to filter' : 'No matching characters found'}
                </div>
              )}

              {!loading && filtered.map((char) => (
                <div key={char.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-optc-border/20 last:border-0 hover:bg-optc-bg-hover/50 transition-colors">
                  <div className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden border-2"
                    style={{ borderColor: getTypeColor(char.type) }}>
                    {!imgErrors.has(parseInt(char.id)) ? (
                      <img src={getCharacterThumbnail(parseInt(char.id))} alt={char.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImgError(parseInt(char.id))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[10px]">
                        #{char.id}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-optc-text text-xs font-medium truncate">{char.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-medium px-1 py-0.5 rounded"
                        style={{ color: getTypeColor(char.type), backgroundColor: `${getTypeColor(char.type)}20` }}>
                        {char.type}
                      </span>
                      <span className="text-optc-text-secondary text-[9px]">
                        {'★'.repeat(Math.min(char.stars || 0, 6))}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {char.effects.map(e => {
                        const isActiveFilter = activeFilters.has(e);
                        return (
                          <span key={e} className={`text-[7px] px-1 py-0.5 rounded ${
                            isActiveFilter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-optc-bg-hover text-optc-text-secondary'
                          }`}>
                            {EFFECT_LABELS[e] || e}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-optc-accent">
                      {Math.round(char.filteredScore * 100)}%
                    </span>
                    <p className="text-[8px] text-optc-text-secondary">match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
