'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Team, TeamUnit } from '@/types/database';
import { getCharacterThumbnail, getTypeBgClass } from '@/lib/optcdb';

interface TeamCardProps {
  team: Team & { units: TeamUnit[] };
}

export default function TeamCard({ team }: TeamCardProps) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  // Sort units by position
  const sortedUnits = [...(team.units || [])].sort((a, b) => a.position - b.position);

  function handleImgError(id: number) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  return (
    <Link href={`/teams/${team.id}`}>
      <div className="stage-card bg-optc-bg-card border border-optc-border rounded-xl p-4
                      hover:border-optc-accent/40 cursor-pointer group">
        {/* Team name and score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-optc-text font-semibold text-sm truncate
                         group-hover:text-optc-accent-hover transition-colors">
              {team.name}
            </h3>
            <p className="text-optc-text-secondary text-xs mt-0.5">
              by {team.submitted_by}
              {team.ship && <span> &bull; {team.ship}</span>}
            </p>
          </div>
          {team.video_url && (
            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
              📹 Video
            </span>
          )}
        </div>

        {/* Unit portraits grid (2x3) */}
        <div className="grid grid-cols-6 gap-1.5">
          {sortedUnits.map((unit) => (
            <div
              key={unit.position}
              className="aspect-square rounded-lg border border-optc-border overflow-hidden
                       bg-optc-bg-hover"
            >
              {!imgErrors.has(unit.unit_id) ? (
                <img
                  src={getCharacterThumbnail(unit.unit_id)}
                  alt={`Unit ${unit.unit_id}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImgError(unit.unit_id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-optc-text-secondary text-xs">
                  {unit.unit_id}
                </div>
              )}
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 6 - sortedUnits.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-lg border border-optc-border/50 bg-optc-bg-hover/50"
            />
          ))}
        </div>

        {/* Description preview */}
        {team.description && (
          <p className="mt-3 text-optc-text-secondary text-xs line-clamp-2">
            {team.description}
          </p>
        )}
      </div>
    </Link>
  );
}
