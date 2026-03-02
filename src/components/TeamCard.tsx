'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Team, TeamUnit } from '@/types/database';
import { getCharacterThumbnail, getTypeColor } from '@/lib/optcdb';

interface TeamCardProps { team: Team & { units: TeamUnit[] }; }

export default function TeamCard({ team }: TeamCardProps) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const sortedUnits = [...(team.units || [])].sort((a, b) => a.position - b.position);
  function handleImgError(id: number) { setImgErrors((prev) => new Set(prev).add(id)); }

  // 2x3 grid: rows of 2
  const rows = [
    sortedUnits.filter(u => u.position <= 2),
    sortedUnits.filter(u => u.position >= 3 && u.position <= 4),
    sortedUnits.filter(u => u.position >= 5),
  ];

  return (
    <Link href={`/teams/${team.id}`}>
      <div className="bg-optc-bg-card border border-optc-border rounded-xl p-4 hover:border-optc-accent/40 cursor-pointer group transition-colors">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-optc-text font-semibold text-sm truncate group-hover:text-optc-accent-hover transition-colors">{team.name}</h3>
            <p className="text-optc-text-secondary text-xs mt-0.5">
              by {team.submitted_by}
              {team.ship && <span> &bull; 🚢 {team.ship}</span>}
            </p>
          </div>
          {team.video_url && (
            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">📹</span>
          )}
        </div>
        {/* 2x3 mini grid */}
        <div className="space-y-1 flex flex-col items-center">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1.5 justify-center">
              {row.map((unit) => (
                <div key={unit.position} className="w-12 h-12 rounded-lg overflow-hidden border-2 relative flex-shrink-0"
                  style={{ borderColor: getTypeColor('') }}>
                  {!imgErrors.has(unit.unit_id) ? (
                    <img src={getCharacterThumbnail(unit.unit_id)} alt={`Unit ${unit.unit_id}`}
                      className="w-full h-full object-cover" onError={() => handleImgError(unit.unit_id)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-optc-text-secondary text-[10px]">{unit.unit_id}</div>
                  )}
                  {unit.support_id && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-optc-accent rounded-tl text-white text-[6px] flex items-center justify-center font-bold">S</div>
                  )}
                </div>
              ))}
              {/* Fill if less than 2 in row */}
              {row.length < 2 && (
                <div className="w-12 h-12 rounded-lg border-2 border-dashed border-optc-border/30 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        {team.description && <p className="mt-3 text-optc-text-secondary text-xs line-clamp-2">{team.description}</p>}
      </div>
    </Link>
  );
}
