'use client';

import { useEffect } from 'react';
import { getShipByName } from '@/lib/optcdb';

interface ShipTooltipProps {
  shipName: string;
  position: 'above' | 'below';
  onClose: () => void;
}

export default function ShipTooltip({ shipName, position, onClose }: ShipTooltipProps) {
  const ship = getShipByName(shipName);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-optc-bg-card border border-optc-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-optc-border bg-optc-bg-hover/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">🚢</span>
              <p className="text-optc-text text-sm font-bold truncate">{shipName}</p>
            </div>
            <button onClick={onClose} className="text-optc-text-secondary hover:text-optc-text p-1 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(70vh - 60px)' }}>
            {ship ? (
              <>
                {ship.boost && (
                  <div>
                    <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Boost</p>
                    <p className="text-optc-text text-xs leading-relaxed">{ship.boost}</p>
                  </div>
                )}
                {ship.special && (
                  <div>
                    <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Special</p>
                    <p className="text-optc-text text-xs leading-relaxed">{ship.special}</p>
                  </div>
                )}
                {ship.superSpecial && (
                  <div>
                    <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Super Special</p>
                    <p className="text-optc-text text-xs leading-relaxed">{ship.superSpecial}</p>
                  </div>
                )}
                {!ship.boost && !ship.special && (
                  <p className="text-optc-text-secondary text-xs py-2">No details available</p>
                )}
              </>
            ) : (
              <p className="text-optc-text-secondary text-xs py-2">Ship not found in database</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
