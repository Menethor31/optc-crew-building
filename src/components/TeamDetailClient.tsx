'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, TeamUnit, TeamGuide, Stage } from '@/types/database';
import { getCharacterThumbnail, getTypeColor, getShipByName, getDualTypeBorderStyle } from '@/lib/optcdb';
import { isMyTeam, removeMyTeam, addMyTeam } from '@/lib/myTeams';
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
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [units, setUnits] = useState<TeamUnit[]>([]);
  const [guides, setGuides] = useState<TeamGuide[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showShipTooltip, setShowShipTooltip] = useState(false);
  const [shipImgError, setShipImgError] = useState(false);

  // Owner features
  const [owner, setOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => { setOwner(isMyTeam(teamId)); }, [teamId]);

  function startEditing() {
    if (!team) return;
    setEditName(team.name);
    setEditDesc(team.description || '');
    setEditVideo(team.video_url || '');
    setEditAuthor(team.submitted_by);
    setEditing(true);
  }

  async function saveEdit() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc, video_url: editVideo, submitted_by: editAuthor }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.team) setTeam(data.team as Team);
        setEditing(false);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (res.ok) {
        removeMyTeam(teamId);
        if (stage) router.push(`/stages/${stage.id}`);
        else router.push('/stages');
        router.refresh();
      }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  }

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
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden relative cursor-pointer"
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
            <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded border-2 overflow-hidden bg-optc-bg-card cursor-pointer"
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
        <p className="text-optc-text-secondary text-[9px] sm:text-[10px] md:text-xs font-medium text-center">{label}</p>
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

      {/* Header */}
      <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-4 sm:p-6 md:p-8">
        <div className="flex items-start gap-3 sm:gap-5">
          {team.ship && (
            <div className="flex-shrink-0 relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-optc-border cursor-pointer bg-optc-bg-hover"
                onClick={() => setShowShipTooltip(!showShipTooltip)}>
                {shipData && !shipImgError ? (
                  <img src={shipData.thumbnail} alt={team.ship} className="w-full h-full object-cover"
                    onError={() => setShipImgError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-xl sm:text-2xl">🚢</span></div>
                )}
              </div>
              <p className="text-optc-text-secondary text-[8px] sm:text-[9px] text-center mt-1 truncate max-w-[60px] sm:max-w-[80px]">{team.ship}</p>
              {showShipTooltip && (
                <ShipTooltip shipName={team.ship} position="below" onClose={() => setShowShipTooltip(false)} />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-optc-text">{team.name}</h1>
            <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-optc-text-secondary">
              <span>by {team.submitted_by}</span>
              {team.video_url && <a href={team.video_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">&bull; 📹 YouTube</a>}
            </div>
            {team.description && <p className="mt-2 sm:mt-3 text-optc-text-secondary text-xs sm:text-sm">{team.description}</p>}
            {/* Owner actions */}
            {owner ? (
              <div className="mt-3 flex items-center gap-2">
                <button onClick={startEditing}
                  className="text-[10px] sm:text-xs px-3 py-1 rounded-lg border border-optc-border text-optc-text-secondary hover:text-optc-text hover:border-optc-accent/50 transition-colors">
                  ✏️ Edit
                </button>
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="text-[10px] sm:text-xs px-3 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  🗑 Delete
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <button onClick={() => { addMyTeam(teamId); setOwner(true); }}
                  className="text-[10px] sm:text-xs px-3 py-1 rounded-lg border border-optc-border text-optc-text-secondary hover:text-optc-text hover:border-optc-accent/50 transition-colors">
                  🔑 Claim this team
                </button>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <VoteButton teamId={team.id} initialScore={team.score || 0} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-optc-border flex items-center justify-between">
              <h3 className="text-optc-text font-bold text-sm">Edit Team</h3>
              <button onClick={() => setEditing(false)} className="text-optc-text-secondary hover:text-optc-text p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-optc-text-secondary mb-1">Team Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text text-sm focus:outline-none focus:border-optc-accent" />
              </div>
              <div>
                <label className="block text-xs text-optc-text-secondary mb-1">Author</label>
                <input type="text" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text text-sm focus:outline-none focus:border-optc-accent" />
              </div>
              <div>
                <label className="block text-xs text-optc-text-secondary mb-1">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                  className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text text-sm focus:outline-none focus:border-optc-accent resize-y" />
              </div>
              <div>
                <label className="block text-xs text-optc-text-secondary mb-1">YouTube URL</label>
                <input type="url" value={editVideo} onChange={(e) => setEditVideo(e.target.value)}
                  className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text text-sm focus:outline-none focus:border-optc-accent" />
              </div>
            </div>
            <div className="p-4 border-t border-optc-border flex items-center gap-3">
              <button onClick={saveEdit} disabled={saving || !editName.trim()}
                className="px-4 py-2 bg-optc-accent hover:bg-optc-accent-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-optc-text-secondary text-sm hover:text-optc-text transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-optc-bg-card border border-optc-border rounded-2xl shadow-2xl p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="text-optc-text font-bold">Delete this team?</h3>
            <p className="text-optc-text-secondary text-sm mt-2">This action cannot be undone. The team, all units, and guides will be permanently deleted.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2 bg-optc-bg-hover text-optc-text-secondary text-sm font-medium rounded-lg hover:text-optc-text transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team grid */}
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-optc-text mb-3 sm:mb-4">Team</h2>
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-4 sm:gap-8 md:gap-16">
                {row.map((unit) => (
                  <UnitPortrait key={unit.position} unitId={unit.unit_id} supportId={unit.support_id} label={positionLabels[unit.position - 1]} />
                ))}
                {row.length < 2 && <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg border-2 border-dashed border-optc-border/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {team.video_url && getYouTubeEmbed(team.video_url) && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-optc-text mb-3 sm:mb-4">Video Guide</h2>
          <div className="bg-optc-bg-card border border-optc-border rounded-2xl overflow-hidden">
            <div className="aspect-video"><iframe src={getYouTubeEmbed(team.video_url)!} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" /></div>
          </div>
        </div>
      )}

      {guides.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-optc-text mb-3 sm:mb-4">Turn-by-Turn Guide</h2>
          <div className="space-y-3 sm:space-y-4">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-optc-bg-card border border-optc-border rounded-xl p-4 sm:p-5">
                <h3 className="text-optc-accent font-bold text-sm mb-2">Turn {guide.stage_number}</h3>
                <div className="text-optc-text text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{guide.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage && <div className="mt-6 sm:mt-8"><Link href={`/stages/${stage.id}`} className="text-optc-accent hover:text-optc-accent-hover text-sm font-medium">← Back to {stage.name}</Link></div>}
    </div>
  );
}
