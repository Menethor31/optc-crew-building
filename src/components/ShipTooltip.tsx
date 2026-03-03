'use client';

import { getShipByName } from '@/lib/optcdb';

interface ShipTooltipProps {
  shipName: string;
  position: 'above' | 'below';
  onClose: () => void;
}

export default function ShipTooltip({ shipName, position, onClose }: ShipTooltipProps) {
  const ship = getShipByName(shipName);
  const posClass = position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className={`absolute ${posClass} left-1/2 -translate-x-1/2 z-[100] w-72 sm:w-80 bg-optc-bg-card border border-optc-border rounded-xl shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-optc-border bg-optc-bg-hover/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚢</span>
            <p className="text-optc-text text-xs font-bold truncate">{shipName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 py-2 max-h-48 overflow-y-auto space-y-2">
          {ship ? (
            <>
              {ship.boost && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Boost</p>
                  <p className="text-optc-text text-[11px] leading-relaxed">{ship.boost}</p>
                </div>
              )}
              {ship.special && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Special</p>
                  <p className="text-optc-text text-[11px] leading-relaxed">{ship.special}</p>
                </div>
              )}
              {ship.superSpecial && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Super Special</p>
                  <p className="text-optc-text text-[11px] leading-relaxed">{ship.superSpecial}</p>
                </div>
              )}
              {!ship.boost && !ship.special && (
                <p className="text-optc-text-secondary text-[11px] py-2">No details available</p>
              )}
            </>
          ) : (
            <p className="text-optc-text-secondary text-[11px] py-2">Ship not found in database</p>
          )}
        </div>
      </div>
    </>
  );
}
