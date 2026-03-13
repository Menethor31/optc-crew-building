'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, TeamUnit, TeamGuide, Stage } from '@/types/database';
import { getCharacterThumbnail, getTypeColor, getShipByName, getDualTypeBorderStyle } from '@/lib/optcdb';
import CharacterTooltip from './CharacterTooltip';
import ShipTooltip from './ShipTooltip';
import SimilarCharacters from './SimilarCharacters';
import VoteButton from './VoteButton';

interface TeamDetailClientProps { teamId: string; }

const typeCache: Record<number, string> = {};

function useCharType(unitId: number) {
  const [charType, setCharType] = useState<string>(typeCache[unitId] || '');
  useEffect(() => {
    if (typeCache[unitId]) { setCharType(typeCache[unitId]); return; }
    let cancelled = false;
    fetch(`/api/characters/details?id=${unitId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.type && !cancelled) {
          typeCache[unitId] = data.type;
          setCharType(data.type);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [unitId]);
  return charType;
}

export default function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [units, setUnits] = useState<TeamUnit[]>([]);
  const [guides, setGuides] = useState<TeamGuide[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null); // "unit-123" or "support-123"
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

  function UnitPortrait({ unitId, supportId, label }: { unitId: number; supportId?: number | null; label: string }) {
    const charType = useCharType(unitId);
    const borderStyle = charType ? getDualTypeBorderStyle(charType) : { borderColor: '#8B949E', borderWidth: '2px', borderStyle: 'solid' };
    const unitKey = `unit-${unitId}`;
    const supportKey = supportId ? `support-${supportId}` : '';

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <SimilarCharacters unitId={unitId} />
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden relative cursor-pointer"
            style={borderStyle}
            onClick={() => setActiveTooltip(activeTooltip === unitKey ? null : unitKey)}>
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
              onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === supportKey ? null : supportKey); }}>
              {!imgErrors.has(supportId) ? (
                <img src={getCharacterThumbnail(supportId)} alt="Support"
                  className="w-full h-full object-cover" onError={() => handleImgError(supportId)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-optc-bg-hover text-[8px]">S</div>
              )}
            </div>
          )}
          {activeTooltip === unitKey && (
            <CharacterTooltip unitId={unitId} position="above" onClose={() => setActiveTooltip(null)} />
          )}
          {supportId && activeTooltip === supportKey && (
            <CharacterTooltip unitId={supportId} isSupport={true} position="above" onClose={() => setActiveTooltip(null)} />
          )}
        </div>
        <p className="text-optc-text-secondary text-[10px] sm:text-xs font-medium text-center">{label}</p>
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

  const shipData = team.ship ? getShipByName(team.ship) : null;

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

      {/* Header — with ship */}
      <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-5">
          {/* Ship thumbnail */}
          {team.ship && (
            <div className="flex-shrink-0 relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-optc-border cursor-pointer bg-optc-bg-hover"
                onClick={() => setShowShipTooltip(!showShipTooltip)}>
                {shipData && !shipImgError ? (
                  <img src={shipData.thumbnail} alt={team.ship} className="w-full h-full object-cover"
                    onError={() => setShipImgError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">🚢</span></div>
                )}
              </div>
              <p className="text-optc-text-secondary text-[9px] text-center mt-1 truncate max-w-[80px]">{team.ship}</p>
              {showShipTooltip && (
                <ShipTooltip shipName={team.ship} position="below" onClose={() => setShowShipTooltip(false)} />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-optc-text">{team.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-optc-text-secondary">
              <span>by {team.submitted_by}</span>
              {team.video_url && <a href={team.video_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">&bull; 📹 YouTube</a>}
            </div>
            {team.description && <p className="mt-3 text-optc-text-secondary text-sm">{team.description}</p>}
          </div>
          {/* Vote */}
          <div className="flex-shrink-0">
            <VoteButton teamId={team.id} initialScore={team.score || 0} />
          </div>
        </div>
      </div>

      {/* Team grid */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-optc-text mb-4">Team</h2>
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
          <div className="space-y-4">
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
          <h2 className="text-xl font-bold text-optc-text mb-4">Turn-by-Turn Guide</h2>
          <div className="space-y-4">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-optc-bg-card border border-optc-border rounded-xl p-5">
                <h3 className="text-optc-accent font-bold text-sm mb-2">Turn {guide.stage_number}</h3>
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
