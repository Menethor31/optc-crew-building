'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, TeamUnit, TeamGuide, Stage } from '@/types/database';
import { getCharacterThumbnail, getTypeBgClass } from '@/lib/optcdb';

interface TeamDetailClientProps {
  teamId: string;
}

export default function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [units, setUnits] = useState<TeamUnit[]>([]);
  const [guides, setGuides] = useState<TeamGuide[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch team
      const { data: teamData } = await (supabase as any)
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (!teamData) {
        setLoading(false);
        return;
      }

      const typedTeam = teamData as Team;
      setTeam(typedTeam);

      // Fetch stage
      const { data: stageData } = await supabase
        .from('stages')
        .select('*')
        .eq('id', typedTeam.stage_id)
        .single();

      if (stageData) setStage(stageData as Stage);

      // Fetch units
      const { data: unitsData } = await (supabase as any)
        .from('team_units')
        .select('*')
        .eq('team_id', teamId)
        .order('position');

      if (unitsData) setUnits(unitsData as TeamUnit[]);

      // Fetch guides
      const { data: guidesData } = await (supabase as any)
        .from('team_guides')
        .select('*')
        .eq('team_id', teamId)
        .order('sort_order');

      if (guidesData) setGuides(guidesData as TeamGuide[]);

      setLoading(false);
    }

    fetchData();
  }, [teamId]);

  function handleImgError(id: number) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  function renderPortrait(unitId: number, size: string = 'w-16 h-16') {
    if (imgErrors.has(unitId)) {
      return (
        <div className={`${size} rounded-lg bg-optc-bg-hover border border-optc-border flex items-center justify-center text-optc-text-secondary text-xs`}>
          #{unitId}
        </div>
      );
    }
    return (
      <img
        src={getCharacterThumbnail(unitId)}
        alt={`Unit ${unitId}`}
        className={`${size} rounded-lg border border-optc-border object-cover`}
        onError={() => handleImgError(unitId)}
      />
    );
  }

  // Extract YouTube embed URL
  function getYouTubeEmbed(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-optc-text-secondary text-sm">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-optc-text-secondary py-20">Team not found.</p>
      </div>
    );
  }

  const positionLabels = ['Captain', 'Friend Captain', 'Crew 1', 'Crew 2', 'Crew 3', 'Crew 4'];
  const sortedUnits = [...units].sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-optc-text-secondary flex-wrap">
          <li>
            <Link href="/stages" className="hover:text-optc-text transition-colors">Stages</Link>
          </li>
          <li>/</li>
          {stage && (
            <>
              <li>
                <Link href={`/stages/${stage.id}`} className="hover:text-optc-text transition-colors truncate">
                  {stage.name}
                </Link>
              </li>
              <li>/</li>
            </>
          )}
          <li className="text-optc-text truncate">{team.name}</li>
        </ol>
      </nav>

      {/* Team header */}
      <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-optc-text">{team.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-optc-text-secondary">
          <span>by {team.submitted_by}</span>
          {team.ship && <span>&bull; 🚢 {team.ship}</span>}
          {team.video_url && (
            <a
              href={team.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              &bull; 📹 YouTube
            </a>
          )}
        </div>
        {team.description && (
          <p className="mt-4 text-optc-text-secondary text-sm">{team.description}</p>
        )}
      </div>

      {/* Team Composition */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-optc-text mb-4">Team</h2>
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedUnits.map((unit) => (
              <div key={unit.position} className="flex items-center gap-3">
                {renderPortrait(unit.unit_id)}
                <div>
                  <p className="text-optc-text-secondary text-xs font-medium">
                    {positionLabels[unit.position - 1]}
                  </p>
                  <p className="text-optc-text text-sm font-semibold">
                    #{unit.unit_id}
                  </p>
                  {unit.support_id && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-optc-text-secondary text-xs">Support:</span>
                      {renderPortrait(unit.support_id, 'w-6 h-6')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video embed */}
      {team.video_url && getYouTubeEmbed(team.video_url) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-optc-text mb-4">Video Guide</h2>
          <div className="bg-optc-bg-card border border-optc-border rounded-2xl overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbed(team.video_url)!}
                title="Team guide video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stage-by-stage guide */}
      {guides.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-optc-text mb-4">Stage-by-Stage Guide</h2>
          <div className="space-y-4">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-optc-bg-card border border-optc-border rounded-xl p-5"
              >
                <h3 className="text-optc-accent font-bold text-sm mb-2">
                  Stage {guide.stage_number}
                </h3>
                <div className="text-optc-text text-sm leading-relaxed whitespace-pre-wrap">
                  {guide.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      {stage && (
        <div className="mt-8">
          <Link
            href={`/stages/${stage.id}`}
            className="text-optc-accent hover:text-optc-accent-hover text-sm font-medium transition-colors"
          >
            ← Back to {stage.name}
          </Link>
        </div>
      )}
    </div>
  );
}
