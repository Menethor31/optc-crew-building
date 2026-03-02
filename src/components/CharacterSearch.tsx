'use client';

import { useState, useEffect, useRef } from 'react';
import { OPTCCharacter } from '@/types/database';
import { getCharacterThumbnail, getTypeColor } from '@/lib/optcdb';
import CharacterTooltip from './CharacterTooltip';

interface CharacterSearchProps {
  onSelect: (character: OPTCCharacter) => void;
  selectedId?: number | null;
  placeholder?: string;
  label?: string;
  compact?: boolean;
}

export default function CharacterSearch({
  onSelect, selectedId, placeholder = 'Search...', label, compact = false,
}: CharacterSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OPTCCharacter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<OPTCCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/characters?q=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        if (data.characters) setResults(data.characters);
      } catch (err) { console.error('Error:', err); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    if (isModalOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  function handleSelect(char: OPTCCharacter) {
    setSelected(char); setQuery(''); setResults([]); setIsModalOpen(false); onSelect(char);
  }
  function handleClear(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setSelected(null); setQuery(''); setShowTooltip(false);
    onSelect({ id: 0, name: '', type: '', class: '', stars: 0 });
  }
  function handleImgError(id: number) { setImgErrors((prev) => new Set(prev).add(id)); }

  const size = compact ? 'w-12 h-12' : 'w-20 h-20';

  return (
    <>
      {selected ? (
        <div className="relative group">
          <div className={`${size} rounded-lg overflow-hidden border-2 relative cursor-pointer`}
            style={{ borderColor: getTypeColor(selected.type) }}
            onClick={() => setShowTooltip(!showTooltip)}
            onContextMenu={(e) => { e.preventDefault(); handleClear(); }}>
            {!imgErrors.has(selected.id) ? (
              <img src={getCharacterThumbnail(selected.id)} alt={selected.name}
                className="w-full h-full object-cover" onError={() => handleImgError(selected.id)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-xs text-optc-text-secondary">{selected.id}</div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          {showTooltip && !compact && (
            <CharacterTooltip unitId={selected.id} charName={selected.name}
              charType={selected.type} charClass={selected.class}
              position="above" onClose={() => setShowTooltip(false)} />
          )}
        </div>
      ) : (
        <div className={`${size} rounded-lg border-2 border-dashed border-optc-border hover:border-optc-accent/50 transition-colors cursor-pointer flex items-center justify-center bg-optc-bg-card`}
          onClick={() => setIsModalOpen(true)}>
          <span className={`text-optc-text-secondary ${compact ? 'text-lg' : 'text-xs'}`}>{compact ? '+' : placeholder}</span>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh]"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsModalOpen(false); setQuery(''); setResults([]); } }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative w-[95vw] max-w-lg bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="flex items-center gap-3 p-4 border-b border-optc-border">
              <svg className="w-5 h-5 text-optc-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search character name or ID..."
                className="flex-1 bg-transparent text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none" />
              <button onClick={() => { setIsModalOpen(false); setQuery(''); setResults([]); }}
                className="text-optc-text-secondary hover:text-optc-text p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {loading && <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" /></div>}
              {!loading && query.length >= 2 && results.length === 0 && <div className="py-8 text-center text-optc-text-secondary text-sm">No characters found</div>}
              {!loading && query.length < 2 && <div className="py-8 text-center text-optc-text-secondary text-sm">Type at least 2 characters</div>}
              {results.map((char) => (
                <button key={char.id} onClick={() => handleSelect(char)} type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-optc-bg-hover transition-colors text-left border-b border-optc-border/20 last:border-0">
                  <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border-2"
                    style={{ borderColor: getTypeColor(char.type) }}>
                    {!imgErrors.has(char.id) ? (
                      <img src={getCharacterThumbnail(char.id)} alt={char.name}
                        className="w-full h-full object-cover" onError={() => handleImgError(char.id)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[10px]">{char.id}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-optc-text text-sm truncate">{char.name}</p>
                    <p className="text-optc-text-secondary text-xs">
                      #{char.id} &bull; <span style={{ color: getTypeColor(char.type) }}>{char.type}</span> &bull; {char.class} &bull; {'★'.repeat(Math.min(char.stars || 0, 6))}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
