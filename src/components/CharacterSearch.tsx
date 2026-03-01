'use client';

import { useState, useEffect, useRef } from 'react';
import { OPTCCharacter } from '@/types/database';
import { getCharacterThumbnail, getTypeBgClass, getTypeColor } from '@/lib/optcdb';

interface CharacterSearchProps {
  onSelect: (character: OPTCCharacter) => void;
  selectedId?: number | null;
  placeholder?: string;
  label?: string;
  compact?: boolean; // for support slots
}

export default function CharacterSearch({
  onSelect,
  selectedId,
  placeholder = 'Search character...',
  label,
  compact = false,
}: CharacterSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OPTCCharacter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<OPTCCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setIsOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/characters?q=${encodeURIComponent(query)}&limit=15`);
        const data = await res.json();
        if (data.characters) { setResults(data.characters); setIsOpen(true); }
      } catch (err) { console.error('Error:', err); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSelect(char: OPTCCharacter) {
    setSelected(char); setQuery(''); setIsOpen(false); onSelect(char);
  }
  function handleClear() {
    setSelected(null); setQuery('');
    onSelect({ id: 0, name: '', type: '', class: '', stars: 0 });
  }
  function handleImgError(id: number) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  const size = compact ? 'w-12 h-12' : 'w-20 h-20';

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-xs text-optc-text-secondary mb-1 font-medium">{label}</label>
      )}

      {selected ? (
        <div className="relative group cursor-pointer" onClick={handleClear}>
          <div
            className={`${size} rounded-lg overflow-hidden border-2 relative`}
            style={{ borderColor: getTypeColor(selected.type) }}
          >
            {!imgErrors.has(selected.id) ? (
              <img
                src={getCharacterThumbnail(selected.id)}
                alt={selected.name}
                className="w-full h-full object-cover"
                onError={() => handleImgError(selected.id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-xs text-optc-text-secondary">
                {selected.id}
              </div>
            )}
            {/* Name overlay */}
            {!compact && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                <p className="text-white text-[9px] leading-tight truncate">{selected.name.split(' - ')[0]}</p>
              </div>
            )}
            {/* X button on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            className={`${size} rounded-lg border-2 border-dashed border-optc-border hover:border-optc-accent/50 transition-colors overflow-hidden`}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={compact ? '+' : placeholder}
              className={`w-full h-full bg-optc-bg-card text-optc-text placeholder-optc-text-secondary
                       text-center focus:outline-none ${compact ? 'text-lg' : 'text-[10px] px-1'}`}
            />
          </div>
          {loading && (
            <div className="absolute right-1 top-1">
              <div className="w-3 h-3 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 bg-optc-bg-card border border-optc-border
                      rounded-lg shadow-xl max-h-72 overflow-y-auto" style={{ left: compact ? '-100px' : '0' }}>
          {results.map((char) => (
            <button
              key={char.id}
              onClick={() => handleSelect(char)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-optc-bg-hover
                       transition-colors text-left border-b border-optc-border/30 last:border-0"
              type="button"
            >
              <div
                className="w-10 h-10 rounded flex-shrink-0 overflow-hidden border-2"
                style={{ borderColor: getTypeColor(char.type) }}
              >
                {!imgErrors.has(char.id) ? (
                  <img
                    src={getCharacterThumbnail(char.id)}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImgError(char.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[10px]">
                    {char.id}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-optc-text text-xs truncate">{char.name}</p>
                <p className="text-optc-text-secondary text-[10px]">
                  #{char.id} &bull; {char.type} &bull; {'★'.repeat(Math.min(char.stars || 0, 6))}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-64 mt-1 bg-optc-bg-card border border-optc-border
                      rounded-lg shadow-xl p-3 text-center text-optc-text-secondary text-xs">
          No characters found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
