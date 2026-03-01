'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OPTCCharacter, Stage } from '@/types/database';
import { Ship } from '@/lib/optcdb';
import CharacterSearch from './CharacterSearch';
import ShipSearch from './ShipSearch';

interface TeamFormProps { stage: Stage; }
interface GuideStep { stageNumber: number; description: string; }

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
  const [guides, setGuides] = useState<GuideStep[]>([{ stageNumber: 1, description: '' }]);

  function handleUnitSelect(i: number, c: OPTCCharacter) { const n = [...units]; n[i] = c.id ? c : null; setUnits(n); }
  function handleSupportSelect(i: number, c: OPTCCharacter) { const n = [...supports]; n[i] = c.id ? c : null; setSupports(n); }
  function addGuideStep() { setGuides([...guides, { stageNumber: guides.length + 1, description: '' }]); }
  function removeGuideStep(i: number) { if (guides.length <= 1) return; setGuides(guides.filter((_, j) => j !== i).map((g, j) => ({ ...g, stageNumber: j + 1 }))); }
  function updateGuideStep(i: number, d: string) { const n = [...guides]; n[i] = { ...n[i], description: d }; setGuides(n); }

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
      const gi = guides.filter(g => g.description.trim()).map((g, i) => ({ team_id: (team as any).id, stage_number: g.stageNumber, description: g.description.trim(), sort_order: i }));
      if (gi.length) { const { error: ge } = await (supabase as any).from('team_guides').insert(gi); if (ge) throw new Error(ge.message); }
      router.push(`/teams/${(team as any).id}`); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setSubmitting(false); }
  }

  if (!isOpen) {
    return (<button onClick={() => setIsOpen(true)} className="w-full py-3 bg-optc-accent hover:bg-optc-accent-hover text-white font-semibold rounded-xl transition-colors text-sm">+ Submit a Team</button>);
  }

  // Grid positions: Row 1: [Captain, Friend Captain], Row 2: [Crew 1, Crew 2], Row 3: [Crew 3, Crew 4]
  const rows = [
    { label: ['Captain *', 'Friend Captain *'], indices: [0, 1] },
    { label: ['Crew 1', 'Crew 2'], indices: [2, 3] },
    { label: ['Crew 3', 'Crew 4'], indices: [4, 5] },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-optc-text">Submit a Team</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-optc-text-secondary hover:text-optc-text">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Info fields */}
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
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">Ship (optional)</label>
            <ShipSearch onSelect={setSelectedShip} selectedShip={selectedShip} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-optc-text-secondary mb-1 font-medium">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="General notes..." rows={2} className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent resize-y" />
        </div>
      </div>

      {/* Team Composition - 2 columns x 3 rows */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-optc-text mb-3">Team Composition</h4>
        <div className="space-y-3">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-2 gap-4">
              {row.indices.map((idx, colIdx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-optc-bg rounded-lg border border-optc-border/50">
                  {/* Main unit */}
                  <CharacterSearch onSelect={(c) => handleUnitSelect(idx, c)} selectedId={units[idx]?.id} placeholder="Search..." />
                  {/* Support */}
                  <CharacterSearch onSelect={(c) => handleSupportSelect(idx, c)} selectedId={supports[idx]?.id} placeholder="+" compact={true} />
                  {/* Label */}
                  <span className="text-[10px] text-optc-text-secondary font-medium whitespace-nowrap hidden sm:block">{row.label[colIdx]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Guide */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-optc-text">Stage-by-Stage Guide</h4>
          <button type="button" onClick={addGuideStep} className="text-xs text-optc-accent hover:text-optc-accent-hover font-medium">+ Add Stage</button>
        </div>
        <div className="space-y-3">
          {guides.map((g, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-optc-text-secondary font-medium">Stage {g.stageNumber}</label>
                {guides.length > 1 && <button type="button" onClick={() => removeGuideStep(i)} className="text-optc-text-secondary hover:text-optc-accent text-xs">Remove</button>}
              </div>
              <textarea value={g.description} onChange={(e) => updateGuideStep(i, e.target.value)} placeholder="Turn 1: ..." rows={3} className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2 text-optc-text placeholder-optc-text-secondary text-sm focus:outline-none focus:border-optc-accent resize-y" />
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
