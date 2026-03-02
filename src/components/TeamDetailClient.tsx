'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, TeamUnit, TeamGuide, Stage } from '@/types/database';
import { getCharacterThumbnail, getTypeColor, SHIPS, Ship } from '@/lib/optcdb';
import CharacterTooltip from './CharacterTooltip';
import ShipTooltip from './ShipTooltip';
import SimilarCharacters from './SimilarCharacters';

interface TeamDetailClientProps { teamId: string; }

export default function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [units, setUnits] = useState<TeamUnit[]>([]);
  const [guides, setGuides] = useState<TeamGuide[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [showShipTooltip, setShowShipTooltip] = useState(false);
  const [shipImgError, setShipImgError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: teamData } = await (supabase as any).from('teams').select('*').eq('id', teamId).single();
      if (!teamData) { setLoading(false); return; }
      setTeam(teamData as Team);
      const { data: stageData } = await supabase.from('stages').select('*').eq('id', (teamData as Team).stage_id).single();
      if (stageData) setStage(stageData as Stage);
      const { data: unitsData } = await (supabase as any).from('team_units').select('*').eq('team_id', teamId).order('position');
      if (unitsData) setUnits(unitsData as TeamUnit[]);
      const { data: guidesData } = await (supabase as any).from('team_guides').select('*').eq('team_id', teamId).order('sort_order');
      if (guidesData) setGuides(guidesData as TeamGuide[]);
      setLoading(false);
    }
    fetchData();
  }, [teamId]);

  function handleImgError(id: number) { setImgErrors((prev) => new Set(prev).add(id)); }

  // Find ship data from name
  function getShipData(shipName: string): Ship | null {
    if (!shipName) return null;
    const lower = shipName.toLowerCase();
    return SHIPS.find(s => s.name.toLowerCase() === lower) ||
           SHIPS.find(s => s.name.toLowerCase().includes(lower)) ||
           null;
  }

  function UnitPortrait({ unitId, supportId, label }: { unitId: number; supportId?: number | null; label: string }) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {/* Similar characters button */}
          <SimilarCharacters unitId={unitId} />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 relative cursor-pointer"
            style={{ borderColor: getTypeColor('') }}
            onClick={() => setActiveTooltip(activeTooltip === unitId ? null : unitId)}>
            {!imgErrors.has(unitId) ? (
              <img src={getCharacterThumbnail(unitId)} alt={`Unit ${unitId}`}
                className="w-full h-full object-cover" onError={() => handleImgError(unitId)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-optc-text-secondary text-xs">#{unitId}</div>
            )}
          </div>
          {supportId && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded border-2 overflow-hidden bg-optc-bg-card cursor-pointer"
              style={{ borderColor: getTypeColor('') }}
              onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === supportId ? null : supportId); }}>
              {!imgErrors.has(supportId) ? (
                <img src={getCharacterThumbnail(supportId)} alt={`Support`}
                  className="w-full h-full object-cover" onError={() => handleImgError(supportId)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[8px]">S</div>
              )}
            </div>
          )}
          {activeTooltip === unitId && (
            <CharacterTooltip unitId={unitId} position="above" onClose={() => setActiveTooltip(null)} />
          )}
          {supportId && activeTooltip === supportId && (
            <CharacterTooltip unitId={supportId} position="above" onClose={() => setActiveTooltip(null)} />
          )}
        </div>
        <p className="text-optc-text-secondary text-[10px] sm:text-xs font-medium text-center">{label}</p>
      </div>
    );
  }

  function ShipPortrait({ shipName }: { shipName: string }) {
    const shipData = getShipData(shipName);
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-optc-border relative cursor-pointer bg-optc-bg-card"
            onClick={() => setShowShipTooltip(!showShipTooltip)}>
            {shipData && !shipImgError ? (
              <img src={shipData.thumbnail} alt={shipName}
                className="w-full h-full object-cover"
                onError={() => setShipImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover">
                <span className="text-2xl">🚢</span>
              </div>
            )}
            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
              <p className="text-white text-[8px] leading-tight truncate text-center">{shipName}</p>
            </div>
          </div>
          {showShipTooltip && (
            <ShipTooltip shipName={shipName} position="above" onClose={() => setShowShipTooltip(false)} />
          )}
        </div>
        <p className="text-optc-text-secondary text-[10px] sm:text-xs font-medium text-center">Ship</p>
      </div>
    );
  }

  function getYouTubeEmbed(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" /></div></div>;
  if (!team) return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><p className="text-center text-optc-text-secondary py-20">Team not found.</p></div>;

  const sortedUnits = [...units].sort((a, b) => a.position - b.position);
  const positionLabels = ['Captain', 'Friend Captain', 'Crew 1', 'Crew 2', 'Crew 3', 'Crew 4'];
  const rows = [
    sortedUnits.filter(u => u.position <= 2),
    sortedUnits.filter(u => u.position >= 3 && u.position <= 4),
    sortedUnits.filter(u => u.position >= 5 && u.position <= 6),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-optc-text-secondary flex-wrap">
          <li><Link href="/stages" className="hover:text-optc-text transition-colors">Stages</Link></li>
          <li>/</li>
          {stage && (<><li><Link href={`/stages/${stage.id}`} className="hover:text-optc-text transition-colors truncate">{stage.name}</Link></li><li>/</li></>)}
          <li className="text-optc-text truncate">{team.name}</li>
        </ol>
      </nav>

      <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-optc-text">{team.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-optc-text-secondary">
          <span>by {team.submitted_by}</span>
          {team.video_url && <a href={team.video_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">&bull; 📹 YouTube</a>}
        </div>
        {team.description && <p className="mt-4 text-optc-text-secondary text-sm">{team.description}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-optc-text mb-4">Team</h2>
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
          <div className="flex gap-6 items-start">
            {/* Ship slot */}
            {team.ship && (
              <div className="flex-shrink-0">
                <ShipPortrait shipName={team.ship} />
              </div>
            )}

            {/* Team grid */}
            <div className="flex-1 space-y-4">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-8 sm:gap-16">
                  {row.map((unit) => (
                    <UnitPortrait key={unit.position} unitId={unit.unit_id} supportId={unit.support_id} label={positionLabels[unit.position - 1]} />
                  ))}
                  {row.length < 2 && <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-optc-border/30" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {team.video_url && getYouTubeEmbed(team.video_url) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-optc-text mb-4">Video Guide</h2>
          <div className="bg-optc-bg-card border border-optc-border rounded-2xl overflow-hidden">
            <div className="aspect-video"><iframe src={getYouTubeEmbed(team.video_url)!} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" /></div>
          </div>
        </div>
      )}

      {guides.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-optc-text mb-4">Stage-by-Stage Guide</h2>
          <div className="space-y-4">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-optc-bg-card border border-optc-border rounded-xl p-5">
                <h3 className="text-optc-accent font-bold text-sm mb-2">Stage {guide.stage_number}</h3>
                <div className="text-optc-text text-sm leading-relaxed whitespace-pre-wrap">{guide.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage && <div className="mt-8"><Link href={`/stages/${stage.id}`} className="text-optc-accent hover:text-optc-accent-hover text-sm font-medium">← Back to {stage.name}</Link></div>}
    </div>
  );
}
