'use client';

import { useState, useEffect } from 'react';

interface ShipTooltipProps {
  shipName: string;
  position: 'above' | 'below';
  onClose: () => void;
}

interface ShipDetail {
  name: string;
  boost?: string;
  special?: string;
  specialCooldown?: number;
  superSpecial?: string;
}

// Cache
const shipCache: Record<string, ShipDetail | null> = {};

function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<(?!\/?(?:b|strong|i|em|br|span|u|small)\b)[^>]*>/gi, '')
    .replace(/\n/g, '<br/>');
}

// Format boost object to readable string
function formatBoost(boost: any): string {
  if (!boost) return '';
  if (typeof boost === 'string') return boost;

  const parts: string[] = [];

  // Common boost format: { hp: 1.3, atk: 1.5, rcv: 1.0 } or similar
  if (boost.hp && boost.hp !== 1) parts.push(`HP x${boost.hp}`);
  if (boost.atk && boost.atk !== 1) parts.push(`ATK x${boost.atk}`);
  if (boost.rcv && boost.rcv !== 1) parts.push(`RCV x${boost.rcv}`);

  if (parts.length > 0) return parts.join(', ');

  // Try to stringify if it's another format
  try {
    return JSON.stringify(boost);
  } catch {
    return String(boost);
  }
}

export default function ShipTooltip({ shipName, position, onClose }: ShipTooltipProps) {
  const [detail, setDetail] = useState<ShipDetail | null>(shipCache[shipName] || null);
  const [loading, setLoading] = useState(!shipCache[shipName]);

  useEffect(() => {
    if (shipCache[shipName] !== undefined) {
      setDetail(shipCache[shipName]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchShip() {
      try {
        const res = await fetch(`/api/ships?name=${encodeURIComponent(shipName)}`);
        if (res.ok) {
          const data = await res.json();
          shipCache[shipName] = data;
          if (!cancelled) setDetail(data);
        } else {
          shipCache[shipName] = null;
        }
      } catch (e) {
        console.error(e);
        shipCache[shipName] = null;
      }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchShip();
    return () => { cancelled = true; };
  }, [shipName]);

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
          {loading && (
            <div className="flex items-center justify-center py-3">
              <div className="w-4 h-4 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && detail && (
            <>
              {detail.boost && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Boost</p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatBoost(detail.boost)) }} />
                </div>
              )}
              {detail.special && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">
                    Special{detail.specialCooldown ? ` (${detail.specialCooldown} turns)` : ''}
                  </p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.special) }} />
                </div>
              )}
              {detail.superSpecial && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Super Special</p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.superSpecial) }} />
                </div>
              )}
              {!detail.boost && !detail.special && !detail.superSpecial && (
                <p className="text-optc-text-secondary text-[11px] py-2">No details available for this ship</p>
              )}
            </>
          )}

          {!loading && !detail && (
            <p className="text-optc-text-secondary text-[11px] py-2">Ship details not found</p>
          )}
        </div>
      </div>
    </>
  );
}
