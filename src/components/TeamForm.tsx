'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OPTCCharacter, Stage } from '@/types/database';
import CharacterSearch from './CharacterSearch';

interface TeamFormProps {
  stage: Stage;
}

interface GuideStep {
  stageNumber: number;
  description: string;
}

export default function TeamForm({ stage }: TeamFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [ship, setShip] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');

  // Team units (positions 1-6)
  const [units, setUnits] = useState<(OPTCCharacter | null)[]>([null, null, null, null, null, null]);
  const [supports, setSupports] = useState<(OPTCCharacter | null)[]>([null, null, null, null, null, null]);

  // Guide steps
  const [guides, setGuides] = useState<GuideStep[]>([
    { stageNumber: 1, description: '' },
  ]);

  const positionLabels = [
    'Captain',
    'Friend Captain',
    'Crew Member 1',
    'Crew Member 2',
    'Crew Member 3',
    'Crew Member 4',
  ];

  function handleUnitSelect(index: number, char: OPTCCharacter) {
    const newUnits = [...units];
    newUnits[index] = char.id ? char : null;
    setUnits(newUnits);
  }

  function handleSupportSelect(index: number, char: OPTCCharacter) {
    const newSupports = [...supports];
    newSupports[index] = char.id ? char : null;
    setSupports(newSupports);
  }

  function addGuideStep() {
    setGuides([...guides, { stageNumber: guides.length + 1, description: '' }]);
  }

  function removeGuideStep(index: number) {
    if (guides.length <= 1) return;
    const newGuides = guides.filter((_, i) => i !== index).map((g, i) => ({
      ...g,
      stageNumber: i + 1,
    }));
    setGuides(newGuides);
  }

  function updateGuideStep(index: number, description: string) {
    const newGuides = [...guides];
    newGuides[index] = { ...newGuides[index], description };
    setGuides(newGuides);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!teamName.trim()) {
      setError('Please enter a team name.');
      return;
    }
    if (!units[0] || !units[1]) {
      setError('Please select at least a Captain and Friend Captain.');
      return;
    }

    const filledUnits = units.filter((u): u is OPTCCharacter => u !== null);
    if (filledUnits.length < 2) {
      setError('Please select at least 2 units.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Insert team
      const { data: team, error: teamError } = await (supabase as any)
        .from('teams')
        .insert({
          stage_id: stage.id,
          name: teamName.trim(),
          description: description.trim() || null,
          video_url: videoUrl.trim() || null,
          captain_id: units[0]!.id,
          friend_captain_id: units[1]!.id,
          ship: ship.trim() || null,
          submitted_by: submittedBy.trim() || 'Anonymous',
        })
        .select()
        .single();

      if (teamError || !team) {
        throw new Error(teamError?.message || 'Failed to create team');
      }

      // 2. Insert team units
      const unitInserts = units
        .map((unit, index) => {
          if (!unit) return null;
          return {
            team_id: (team as { id: string }).id,
            unit_id: unit.id,
            position: index + 1,
            support_id: supports[index]?.id || null,
          };
        })
        .filter((u) => u !== null);

      if (unitInserts.length > 0) {
        const { error: unitsError } = await (supabase as any)
          .from('team_units')
          .insert(unitInserts);

        if (unitsError) throw new Error(unitsError.message);
      }

      // 3. Insert guide steps
      const guideInserts = guides
        .filter((g) => g.description.trim())
        .map((g, index) => ({
          team_id: (team as { id: string }).id,
          stage_number: g.stageNumber,
          description: g.description.trim(),
          sort_order: index,
        }));

      if (guideInserts.length > 0) {
        const { error: guidesError } = await (supabase as any)
          .from('team_guides')
          .insert(guideInserts);

        if (guidesError) throw new Error(guidesError.message);
      }

      // Success - redirect to team page
      router.push(`/teams/${(team as { id: string }).id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-optc-accent hover:bg-optc-accent-hover text-white
                 font-semibold rounded-xl transition-colors text-sm"
      >
        + Submit a Team
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-optc-text">Submit a Team</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-optc-text-secondary hover:text-optc-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Team Name & Info */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
              Team Name *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={`e.g. ${stage.name} - PSY Roger`}
              className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                       text-optc-text placeholder-optc-text-secondary text-sm
                       focus:outline-none focus:border-optc-accent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
              Your Name
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Anonymous"
              className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                       text-optc-text placeholder-optc-text-secondary text-sm
                       focus:outline-none focus:border-optc-accent transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
              YouTube Video (optional)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                       text-optc-text placeholder-optc-text-secondary text-sm
                       focus:outline-none focus:border-optc-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
              Ship (optional)
            </label>
            <input
              type="text"
              value={ship}
              onChange={(e) => setShip(e.target.value)}
              placeholder="e.g. Thousand Sunny, Merry Go"
              className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                       text-optc-text placeholder-optc-text-secondary text-sm
                       focus:outline-none focus:border-optc-accent transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-optc-text-secondary mb-1 font-medium">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="General notes about this team..."
            rows={2}
            className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                     text-optc-text placeholder-optc-text-secondary text-sm
                     focus:outline-none focus:border-optc-accent transition-colors resize-y"
          />
        </div>
      </div>

      {/* Team Composition */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-optc-text mb-3">Team Composition</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {positionLabels.map((label, index) => (
            <div key={index} className="space-y-1">
              <CharacterSearch
                label={`${label} ${index < 2 ? '*' : ''}`}
                onSelect={(char) => handleUnitSelect(index, char)}
                selectedId={units[index]?.id}
                placeholder={`Search ${label.toLowerCase()}...`}
              />
              <CharacterSearch
                label={`${label} Support`}
                onSelect={(char) => handleSupportSelect(index, char)}
                selectedId={supports[index]?.id}
                placeholder="Support (optional)..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Guide */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-optc-text">Stage-by-Stage Guide</h4>
          <button
            type="button"
            onClick={addGuideStep}
            className="text-xs text-optc-accent hover:text-optc-accent-hover transition-colors font-medium"
          >
            + Add Stage
          </button>
        </div>
        <div className="space-y-3">
          {guides.map((guide, index) => (
            <div key={index} className="relative">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-optc-text-secondary font-medium">
                  Stage {guide.stageNumber}
                </label>
                {guides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGuideStep(index)}
                    className="text-optc-text-secondary hover:text-optc-accent text-xs transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={guide.description}
                onChange={(e) => updateGuideStep(index, e.target.value)}
                placeholder={`Turn 1: Swap to Rebecca and target Hody...\nTurn 2: Use specials and clear the stage...`}
                rows={3}
                className="w-full bg-optc-bg border border-optc-border rounded-lg px-3 py-2
                         text-optc-text placeholder-optc-text-secondary text-sm
                         focus:outline-none focus:border-optc-accent transition-colors resize-y"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-optc-accent hover:bg-optc-accent-hover text-white
                   font-semibold rounded-xl transition-colors text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Team'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-6 py-2.5 bg-optc-bg-hover text-optc-text-secondary
                   font-medium rounded-xl transition-colors text-sm hover:text-optc-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
