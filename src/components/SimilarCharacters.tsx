'use client';

import { useState } from 'react';
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

// Effect labels for display
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
  const [similar, setSimilar] = useState<SimilarChar[]>([]);
  const [sourceEffects, setSourceEffects] = useState<string[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  async function handleOpen() {
    setIsOpen(true);
    if (similar.length > 0) return; // Already loaded
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/similar?id=${unitId}&limit=8`);
      const data = await res.json();
      if (data.similar) setSimilar(data.similar);
      if (data.sourceEffects) setSourceEffects(data.sourceEffects);
    } catch (e) {
      console.error(e);
    }
    finally { setLoading(false); }
  }

  function handleImgError(id: number) { setImgErrors(prev => new Set(prev).add(id)); }

  return (
    <>
      {/* Small button on top-right of the character portrait */}
      <button
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-optc-accent hover:bg-optc-accent-hover text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-md transition-colors"
        title="Find similar characters"
      >
        ↔
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[5vh] sm:pt-[10vh]"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[95vw] max-w-lg bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-optc-border">
              <div>
                <h3 className="text-optc-text font-bold text-sm">Similar Characters</h3>
                {sourceEffects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sourceEffects.map(e => (
                      <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-optc-accent/20 text-optc-accent">
                        {EFFECT_LABELS[e] || e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)}
                className="text-optc-text-secondary hover:text-optc-text p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && similar.length === 0 && (
                <div className="py-12 text-center text-optc-text-secondary text-sm">
                  No similar characters found
                </div>
              )}

              {!loading && similar.map((char) => (
                <div key={char.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-optc-border/20 last:border-0 hover:bg-optc-bg-hover/50 transition-colors">
                  {/* Portrait */}
                  <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border-2"
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-optc-text text-sm truncate">{char.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-medium px-1 py-0.5 rounded"
                        style={{ color: getTypeColor(char.type), backgroundColor: `${getTypeColor(char.type)}20` }}>
                        {char.type}
                      </span>
                      <span className="text-optc-text-secondary text-[10px]">
                        {'★'.repeat(Math.min(char.stars || 0, 6))}
                      </span>
                    </div>
                    {/* Matching effects */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {char.effects.map(e => (
                        <span key={e} className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {EFFECT_LABELS[e] || e}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-optc-accent">
                      {Math.round(char.score * 100)}%
                    </span>
                    <p className="text-[9px] text-optc-text-secondary">match</p>
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
