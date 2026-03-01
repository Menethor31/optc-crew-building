'use client';

import { useState, useEffect, useRef } from 'react';
import { Ship, searchShips, SHIPS } from '@/lib/optcdb';

interface ShipSearchProps {
  onSelect: (ship: Ship | null) => void;
  selectedShip?: Ship | null;
}

export default function ShipSearch({ onSelect, selectedShip }: ShipSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ship[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    setResults(searchShips(query));
  }, [query]);

  function handleImgError(id: number) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  if (selectedShip) {
    return (
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2 p-2 rounded-lg border border-optc-border bg-optc-bg-card cursor-pointer group"
          onClick={() => { onSelect(null); }}>
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-optc-border">
            {!imgErrors.has(selectedShip.id) ? (
              <img src={selectedShip.thumbnail} alt={selectedShip.name} className="w-full h-full object-cover"
                onError={() => handleImgError(selectedShip.id)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-xs">🚢</div>
            )}
          </div>
          <span className="text-optc-text text-sm flex-1 truncate">{selectedShip.name}</span>
          <svg className="w-4 h-4 text-optc-text-secondary group-hover:text-optc-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search ship..."
        className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                 text-optc-text placeholder-optc-text-secondary text-sm
                 focus:outline-none focus:border-optc-accent transition-colors"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-optc-bg-card border border-optc-border
                      rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {results.map((ship) => (
            <button
              key={ship.id}
              onClick={() => { onSelect(ship); setQuery(''); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-optc-bg-hover
                       transition-colors text-left border-b border-optc-border/30 last:border-0"
              type="button"
            >
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-optc-border">
                {!imgErrors.has(ship.id) ? (
                  <img src={ship.thumbnail} alt={ship.name} className="w-full h-full object-cover"
                    onError={() => handleImgError(ship.id)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[10px]">🚢</div>
                )}
              </div>
              <span className="text-optc-text text-xs truncate">{ship.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
