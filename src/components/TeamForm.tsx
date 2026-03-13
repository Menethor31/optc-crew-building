'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OPTCCharacter, Stage } from '@/types/database';
import { Ship, getCharacterThumbnail } from '@/lib/optcdb';
import { addMyTeam } from '@/lib/myTeams';
import CharacterSearch from './CharacterSearch';
import ShipSearch from './ShipSearch';

interface TeamFormProps { stage: Stage; }

interface TurnAction {
  unitIndex: number;
  action: '' | 'special' | 'switch';
}

interface GuideTurn {
  turnNumber: number;
  actions: TurnAction[];
  note: string;
}

const POSITION_LABELS = ['Captain', 'Friend Captain', 'Crew 1', 'Crew 2', 'Crew 3', 'Crew 4'];

export default function TeamForm({ stage }: TeamFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [submittedBy, setSubmittedBy] = useState('');
  const [units, setUnits] = useState<(OPTCCharacter | null)[]>([null, null, null, null, null, null]);
  const [supports, setSupports] = useState<(OPTCCharacter | null)[]>([null, null, null, null, null, null]);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const emptyTurn = (n: number): GuideTurn => ({ turnNumber: n, actions: [], note: '' });
  const [turns, setTurns] = useState<GuideTurn[]>([emptyTurn(1), emptyTurn(2), emptyTurn(3)]);

  function handleUnitSelect(i: number, c: OPTCCharacter) { const n = [...units]; n[i] = c.id ? c : null; setUnits(n); }
  function handleSupportSelect(i: number, c: OPTCCharacter) { const n = [...supports]; n[i] = c.id ? c : null; setSupports(n); }
  function handleImgError(id: number) { setImgErrors((prev) => new Set(prev).add(id)); }

  function addTurn() { setTurns([...turns, emptyTurn(turns.length + 1)]); }
  function removeTurn(i: number) {
    if (turns.length <= 1) return;
    setTurns(turns.filter((_, j) => j !== i).map((t, j) => ({ ...t, turnNumber: j + 1 })));
  }

  function toggleUnitAction(turnIdx: number, unitIdx: number) {
    const newTurns = [...turns];
    const turn = { ...newTurns[turnIdx] };
    const existingIdx = turn.actions.findIndex(a => a.unitIndex === unitIdx);
    if (existingIdx >= 0) {
      const current = turn.actions[existingIdx].action;
      if (current === 'special') {
        turn.actions = [...turn.actions];
        turn.actions[existingIdx] = { ...turn.actions[existingIdx], action: 'switch' };
      } else {
        turn.actions = turn.actions.filter((_, i) => i !== existingIdx);
      }
    } else {
      turn.actions = [...turn.actions, { unitIndex: unitIdx, action: 'special' }];
    }
    newTurns[turnIdx] = turn;
    setTurns(newTurns);
  }

  function updateTurnNote(turnIdx: number, note: string) {
    const newTurns = [...turns];
    newTurns[turnIdx] = { ...newTurns[turnIdx], note };
    setTurns(newTurns);
  }

  function compileTurnDescription(turn: GuideTurn): string {
    const parts: string[] = [];
    const activeActions = turn.actions.filter(a => a.action !== '');
    if (activeActions.length > 0) {
      const actionTexts = activeActions.map(a => {
        const unitName = units[a.unitIndex]?.name || POSITION_LABELS[a.unitIndex];
        const actionLabel = a.action === 'special' ? 'Use Special' : 'Use Switch';
        return unitName + ': ' + actionLabel;
      });
      parts.push(actionTexts.join(' | '));
    }
    if (turn.note.trim()) {
      parts.push(turn.note.trim());
    }
    return parts.length > 0 ? parts.join('\n') : 'Skip';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!teamName.trim()) { setError('Please enter a team name.'); return; }
    if (!units[0] || !units[1]) { setError('Please select at least a Captain and Friend Captain.'); return; }
    setSubmitting(true);
    try {
      const { data: team, error: te } = await (supabase as any).from('teams').insert({
        stage_id: stage.id, name: teamName.trim(), description: description.trim() || null,
        video_url: videoUrl.trim() || null, captain_id: units[0]!.id, friend_captain_id: units[1]!.id,
        ship: selectedShip?.name || null, submitted_by: submittedBy.trim() || 'Anonymous',
      }).select().single();
      if (te || !team) throw new Error(te?.message || 'Failed');
      const ui = units.map((u, i) => u ? { team_id: (team as any).id, unit_id: u.id, position: i + 1, support_id: supports[i]?.id || null } : null).filter(Boolean);
      if (ui.length) { const { error: ue } = await (supabase as any).from('team_units').insert(ui); if (ue) throw new Error(ue.message); }
      const gi = turns.map((t, i) => ({
        team_id: (team as any).id, stage_number: t.turnNumber, description: compileTurnDescription(t), sort_order: i,
      }));
      if (gi.length) { const { error: ge } = await (supabase as any).from('team_guides').insert(gi); if (ge) throw new Error(ge.message); }
      addMyTeam((team as any).id);
      router.push(`/teams/${(team as any).id}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setSubmitting(false); }
  }

  if (!isOpen) {
    return (<button onClick={() => setIsOpen(true)} className="w-full py-3 bg-optc-accent hover:bg-optc-accent-hover text-white font-semibold rounded-xl transition-colors text-sm">+ Submit a Team</button>);
  }

  const compRows = [
    { label: ['Captain *', 'Friend Captain *'], indices: [0, 1] },
    { label: ['Crew 1', 'Crew 2'], indices: [2, 3] },
    { label: ['Crew 3', 'Crew 4'], indices: [4, 5] },
  ];

  const activeUnits = units.map((u, i) => ({ unit: u, index: i })).filter(x => x.unit !== null);

  return (
    <form onSubmit={handleSubmit} className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-optc-text">Submit a Team</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-optc-text-secondary hover:text-optc-text">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">Team Name *</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={`e.g. ${stage.name} - PSY Roger`} className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent" required />
          </div>
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">Your Name</label>
            <input type="text" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} placeholder="Anonymous" className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">YouTube Video (optional)</label>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent" />
          </div>
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="General notes..." rows={1} className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent resize-y" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-bold text-optc-text mb-3">Team Composition</h4>
        <div className="flex gap-6 items-start">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-optc-text-secondary font-medium">Ship</span>
            <ShipSearch onSelect={setSelectedShip} selectedShip={selectedShip} />
          </div>
          <div className="flex-1 space-y-2">
            {compRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-4 sm:gap-6">
                {row.indices.map((idx, colIdx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-optc-text-secondary font-medium">{row.label[colIdx]}</span>
                    <div className="flex items-end gap-1">
                      <CharacterSearch onSelect={(c) => handleUnitSelect(idx, c)} selectedId={units[idx]?.id} placeholder="Search..." />
                      <CharacterSearch onSelect={(c) => handleSupportSelect(idx, c)} selectedId={supports[idx]?.id} placeholder="+" compact={true} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-optc-text">Turn-by-Turn Guide</h4>
          <button type="button" onClick={addTurn} className="text-xs text-optc-accent hover:text-optc-accent-hover font-medium">+ Add Turn</button>
        </div>

        {activeUnits.length === 0 && (
          <p className="text-optc-text-secondary text-xs mb-3">Select team members above to enable actions</p>
        )}

        <div className="space-y-3">
          {turns.map((turn, turnIdx) => (
            <div key={turnIdx} className="bg-optc-bg border border-optc-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-optc-accent">Turn {turn.turnNumber}</span>
                {turns.length > 1 && (
                  <button type="button" onClick={() => removeTurn(turnIdx)} className="text-optc-text-secondary hover:text-optc-accent text-[10px]">Remove</button>
                )}
              </div>

              {activeUnits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {activeUnits.map(({ unit, index }) => {
                    const action = turn.actions.find(a => a.unitIndex === index);
                    const actionLabel = action?.action === 'special' ? 'SPE' : action?.action === 'switch' ? 'SWI' : '';
                    return (
                      <button key={index} type="button"
                        onClick={() => toggleUnitAction(turnIdx, index)}
                        className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border text-[10px] transition-all ${
                          action?.action === 'special'
                            ? 'border-optc-accent bg-optc-accent/15 text-optc-accent'
                            : action?.action === 'switch'
                              ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                              : 'border-optc-border/50 bg-optc-bg-hover/50 text-optc-text-secondary hover:border-optc-border'
                        }`}
                        title={POSITION_LABELS[index] + ': click to cycle Special > Switch > Off'}>
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 border border-optc-border/50">
                          {!imgErrors.has(unit!.id) ? (
                            <img src={getCharacterThumbnail(unit!.id)} alt="" className="w-full h-full object-cover"
                              onError={() => handleImgError(unit!.id)} />
                          ) : (
                            <div className="w-full h-full bg-optc-bg-hover text-[6px] flex items-center justify-center">{unit!.id}</div>
                          )}
                        </div>
                        {actionLabel && <span className="font-bold">{actionLabel}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <input type="text" value={turn.note} onChange={(e) => updateTurnNote(turnIdx, e.target.value)}
                placeholder="Notes (blank = Skip)"
                className="w-full bg-optc-bg-card border border-optc-border/50 rounded px-2 py-1.5 text-optc-text placeholder-optc-text-secondary text-xs focus:outline-none focus:border-optc-accent" />
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-optc-accent hover:bg-optc-accent-hover text-white font-semibold rounded-xl text-sm disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Team'}</button>
        <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2.5 bg-optc-bg-hover text-optc-text-secondary font-medium rounded-xl text-sm hover:text-optc-text">Cancel</button>
      </div>
    </form>
  );
}
