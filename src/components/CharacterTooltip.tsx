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

const detailsCache: Record<number, CharDetail> = {};

function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<(?!\/?(?:b|strong|i|em|br|span|u|small)\b)[^>]*>/gi, '')
    .replace(/\n/g, '<br/>');
}

export default function CharacterTooltip({ unitId, charName, charType, charClass, position, onClose }: CharacterTooltipProps) {
  const [detail, setDetail] = useState<CharDetail | null>(detailsCache[unitId] || null);
  const [loading, setLoading] = useState(!detailsCache[unitId]);

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

  // Prevent body scroll on mobile when tooltip open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const tooltipContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-optc-border bg-optc-bg-hover/50 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-optc-text text-sm font-bold truncate">{displayName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {displayType && (
              displayType.includes('/') ? (
                <span className="flex items-center gap-0.5">
                  {displayType.split('/').map((t: string, i: number) => (
                    <span key={i} className="text-[10px] font-medium px-1 py-0.5 rounded" style={{ color: getTypeColor(t), backgroundColor: `${getTypeColor(t)}20` }}>
                      {t.trim()}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: getTypeColor(displayType), backgroundColor: `${getTypeColor(displayType)}20` }}>
                  {displayType}
                </span>
              )
            )}
            {displayClass && <span className="text-optc-text-secondary text-[10px]">{displayClass}</span>}
            <span className="text-optc-text-secondary text-[10px]">#{unitId}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-optc-text-secondary hover:text-optc-text p-1 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(70vh - 60px)' }}>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && detail && (
          <>
            {detail.captain && (
              <div>
                <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Captain Ability</p>
                <p className="text-optc-text text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.captain) }} />
              </div>
            )}
            {detail.special && (
              <div>
                <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">
                  Special{detail.specialName ? `: ${detail.specialName}` : ''}
                </p>
                <p className="text-optc-text text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.special) }} />
              </div>
            )}
            {detail.cooldown && (
              <div>
                <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Min Cooldown</p>
                <p className="text-optc-text text-xs">{detail.cooldown} turns</p>
              </div>
            )}
            {detail.sailor && (
              <div>
                <p className="text-[10px] font-bold text-optc-accent uppercase tracking-wide mb-1">Sailor Ability</p>
                <p className="text-optc-text text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.sailor) }} />
              </div>
            )}
          </>
        )}

        {!loading && !detail && (
          <p className="text-optc-text-secondary text-xs py-2">No details available</p>
        )}
      </div>
    </>
  );

  // Render as a centered modal (works well on both mobile and desktop)
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-optc-bg-card border border-optc-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}>
          {tooltipContent}
        </div>
      </div>
    </>
  );
}
