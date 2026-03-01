'use client';

import { useState, useEffect, useRef } from 'react';
import { OPTCCharacter } from '@/types/database';
import { getCharacterThumbnail, getTypeBgClass } from '@/lib/optcdb';

interface CharacterSearchProps {
  onSelect: (character: OPTCCharacter) => void;
  selectedId?: number | null;
  placeholder?: string;
  label?: string;
}

export default function CharacterSearch({
  onSelect,
  selectedId,
  placeholder = 'Search character...',
  label,
}: CharacterSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OPTCCharacter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<OPTCCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search via API with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/characters?q=${encodeURIComponent(query)}&limit=15`);
        const data = await res.json();
        if (data.characters) {
          setResults(data.characters);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error searching characters:', err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(char: OPTCCharacter) {
    setSelected(char);
    setQuery('');
    setIsOpen(false);
    onSelect(char);
  }

  function handleClear() {
    setSelected(null);
    setQuery('');
    onSelect({ id: 0, name: '', type: '', class: '', stars: 0 });
  }

  function handleImgError(id: number) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
          {label}
        </label>
      )}

      {selected ? (
        // Selected character display
        <div className={`flex items-center gap-2 p-2 rounded-lg border-2 ${getTypeBgClass(selected.type)}`}>
          {!imgErrors.has(selected.id) ? (
            <img
              src={getCharacterThumbnail(selected.id)}
              alt={selected.name}
              className="w-10 h-10 rounded"
              onError={() => handleImgError(selected.id)}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-optc-bg-hover flex items-center justify-center text-xs">
              {selected.id}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-optc-text text-xs font-medium truncate">{selected.name}</p>
            <p className="text-optc-text-secondary text-xs">
              #{selected.id} &bull; {selected.type} &bull; {'★'.repeat(Math.min(selected.stars || 0, 6))}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="text-optc-text-secondary hover:text-optc-accent transition-colors p-1"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        // Search input
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-optc-bg-card border border-optc-border rounded-lg px-3 py-2
                     text-optc-text placeholder-optc-text-secondary text-sm
                     focus:outline-none focus:border-optc-accent transition-colors"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-optc-bg-card border border-optc-border
                      rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((char) => (
            <button
              key={char.id}
              onClick={() => handleSelect(char)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-optc-bg-hover
                       transition-colors text-left border-b border-optc-border/50 last:border-0"
              type="button"
            >
              {!imgErrors.has(char.id) ? (
                <img
                  src={getCharacterThumbnail(char.id)}
                  alt={char.name}
                  className="w-8 h-8 rounded flex-shrink-0"
                  onError={() => handleImgError(char.id)}
                />
              ) : (
                <div className="w-8 h-8 rounded bg-optc-bg-hover flex items-center justify-center text-xs flex-shrink-0">
                  {char.id}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-optc-text text-xs truncate">{char.name}</p>
                <p className="text-optc-text-secondary text-xs">
                  #{char.id} &bull; {char.type} &bull; {'★'.repeat(Math.min(char.stars || 0, 6))}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-optc-bg-card border border-optc-border
                      rounded-lg shadow-xl p-3 text-center text-optc-text-secondary text-xs">
          No characters found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
