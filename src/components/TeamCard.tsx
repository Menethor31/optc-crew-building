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

  const captain = sortedUnits.find(u => u.position === 1);
  const friendCaptain = sortedUnits.find(u => u.position === 2);
  const crew = sortedUnits.filter(u => u.position >= 3 && u.position <= 6);
  const displayOrder = [captain, ...crew, friendCaptain].filter(Boolean) as TeamUnit[];

  function UnitMini({ unit }: { unit: TeamUnit }) {
    const isCaptain = unit.position === 1;
    const isFriend = unit.position === 2;
    const isSpecial = isCaptain || isFriend;
    return (
      <div className="flex flex-col items-center" style={{ width: isSpecial ? 48 : 44 }}>
        {/* Label row — fixed height always reserved */}
        <div className="h-3 flex items-center justify-center">
          {isSpecial && (
            <span className={`text-[7px] font-bold uppercase tracking-wider ${isCaptain ? 'text-red-400' : 'text-blue-400'}`}>
              {isCaptain ? 'CPT' : 'GUEST'}
            </span>
          )}
        </div>
        {/* Main unit */}
        <div className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 mt-0.5 ${isSpecial ? 'w-11 h-11 sm:w-12 sm:h-12' : 'w-10 h-10 sm:w-11 sm:h-11'}`}
          style={{ borderColor: isCaptain ? '#E74C3C' : isFriend ? '#3498DB' : getTypeColor('') }}>
          {!imgErrors.has(unit.unit_id) ? (
            <img src={getCharacterThumbnail(unit.unit_id)} alt={`Unit ${unit.unit_id}`}
              className="w-full h-full object-cover" onError={() => handleImgError(unit.unit_id)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-optc-text-secondary text-[8px]">{unit.unit_id}</div>
          )}
        </div>
        {/* Support row — fixed height always reserved */}
        <div className="h-5 mt-0.5 flex items-center justify-center">
          {unit.support_id && (
            <div className="w-5 h-5 rounded overflow-hidden border border-optc-border flex-shrink-0">
              {!imgErrors.has(unit.support_id) ? (
                <img src={getCharacterThumbnail(unit.support_id)} alt="S"
                  className="w-full h-full object-cover" onError={() => handleImgError(unit.support_id!)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[6px]">S</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="flex items-start justify-center gap-0.5 sm:gap-1">
          {displayOrder.map((unit) => (
            <UnitMini key={unit.position} unit={unit} />
          ))}
        </div>
        {team.description && <p className="mt-3 text-optc-text-secondary text-xs line-clamp-2">{team.description}</p>}
      </div>
    </Link>
  );
}
