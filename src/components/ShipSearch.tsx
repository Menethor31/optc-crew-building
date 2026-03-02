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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResults(searchShips(query));
  }, [query]);

  useEffect(() => {
    if (isModalOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  function handleImgError(id: number) { setImgErrors((prev) => new Set(prev).add(id)); }

  // Selected: show as square slot
  if (selectedShip) {
    return (
      <div className="relative group">
        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-optc-border relative cursor-pointer bg-optc-bg-card"
          onClick={() => onSelect(null)}>
          {!imgErrors.has(selectedShip.id) ? (
            <img src={selectedShip.thumbnail} alt={selectedShip.name} className="w-full h-full object-cover"
              onError={() => handleImgError(selectedShip.id)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-xs">🚢</div>
          )}
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
            <p className="text-white text-[8px] leading-tight truncate text-center">{selectedShip.name}</p>
          </div>
          {/* X on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Empty slot
  return (
    <>
      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-optc-border hover:border-optc-accent/50 transition-colors cursor-pointer flex items-center justify-center bg-optc-bg-card"
        onClick={() => setIsModalOpen(true)}>
        <div className="text-center">
          <span className="text-optc-text-secondary text-lg">🚢</span>
          <p className="text-optc-text-secondary text-[9px]">Ship</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh]"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsModalOpen(false); setQuery(''); } }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative w-[95vw] max-w-lg bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="flex items-center gap-3 p-4 border-b border-optc-border">
              <span className="text-lg">🚢</span>
              <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ship..."
                className="flex-1 bg-transparent text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none" />
              <button onClick={() => { setIsModalOpen(false); setQuery(''); }}
                className="text-optc-text-secondary hover:text-optc-text p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {results.map((ship) => (
                <button key={ship.id} onClick={() => { onSelect(ship); setIsModalOpen(false); setQuery(''); }} type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-optc-bg-hover transition-colors text-left border-b border-optc-border/20 last:border-0">
                  <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden border border-optc-border bg-optc-bg-card">
                    {!imgErrors.has(ship.id) ? (
                      <img src={ship.thumbnail} alt={ship.name} className="w-full h-full object-cover"
                        onError={() => handleImgError(ship.id)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🚢</div>
                    )}
                  </div>
                  <span className="text-optc-text text-sm">{ship.name}</span>
                </button>
              ))}
              {results.length === 0 && <div className="py-8 text-center text-optc-text-secondary text-sm">No ships found</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
