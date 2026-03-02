'use client';

import { useState, useEffect } from 'react';
import { getTypeColor } from '@/lib/optcdb';

interface CharacterTooltipProps {
  unitId: number;
  charName?: string;
  charType?: string;
  charClass?: string;
  position: 'above' | 'below';
  onClose: () => void;
}

interface CharDetail {
  name?: string;
  type?: string;
  class?: string;
  stars?: number;
  captain?: string;
  special?: string;
  specialName?: string;
  cooldown?: number;
  sailor?: string;
}

// Cache for fetched details
const detailsCache: Record<number, CharDetail> = {};

// Sanitize HTML: only allow safe tags
function sanitizeHtml(html: string): string {
  if (!html) return '';
  // Allow: b, strong, i, em, br, span, u, small
  // Remove everything else
  return html
    .replace(/<(?!\/?(?:b|strong|i|em|br|span|u|small)\b)[^>]*>/gi, '')
    .replace(/\n/g, '<br/>');
}

export default function CharacterTooltip({ unitId, charName, charType, charClass, position, onClose }: CharacterTooltipProps) {
  const [detail, setDetail] = useState<CharDetail | null>(detailsCache[unitId] || null);
  const [loading, setLoading] = useState(!detailsCache[unitId]);

  // Use provided props or fallback to fetched data
  const displayName = charName || detail?.name || `Unit #${unitId}`;
  const displayType = charType || detail?.type || '';
  const displayClass = charClass || detail?.class || '';

  useEffect(() => {
    if (detailsCache[unitId]) { setDetail(detailsCache[unitId]); setLoading(false); return; }
    let cancelled = false;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/characters/details?id=${unitId}`);
        if (res.ok) {
          const data = await res.json();
          detailsCache[unitId] = data;
          if (!cancelled) setDetail(data);
        }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchDetail();
    return () => { cancelled = true; };
  }, [unitId]);

  const posClass = position === 'above'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';

  return (
    <>
      {/* Invisible overlay to capture clicks outside */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className={`absolute ${posClass} left-1/2 -translate-x-1/2 z-[100] w-72 sm:w-80 bg-optc-bg-card border border-optc-border rounded-xl shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-optc-border bg-optc-bg-hover/50">
          <p className="text-optc-text text-xs font-bold truncate">{displayName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {displayType && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: getTypeColor(displayType), backgroundColor: `${getTypeColor(displayType)}20` }}>
                {displayType}
              </span>
            )}
            {displayClass && <span className="text-optc-text-secondary text-[10px]">{displayClass}</span>}
            <span className="text-optc-text-secondary text-[10px]">#{unitId}</span>
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
              {detail.captain && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Captain Ability</p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.captain) }} />
                </div>
              )}
              {detail.special && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">
                    Special{detail.specialName ? `: ${detail.specialName}` : ''}
                  </p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.special) }} />
                </div>
              )}
              {detail.cooldown && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Min Cooldown</p>
                  <p className="text-optc-text text-[11px]">{detail.cooldown} turns</p>
                </div>
              )}
              {detail.sailor && (
                <div>
                  <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide">Sailor Ability</p>
                  <p className="text-optc-text text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.sailor) }} />
                </div>
              )}
            </>
          )}

          {!loading && !detail && (
            <p className="text-optc-text-secondary text-[11px] py-2">No details available</p>
          )}
        </div>
      </div>
    </>
  );
}
