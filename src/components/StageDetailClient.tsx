'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Stage, Team, TeamUnit } from '@/types/database';
import StageTypeBadge from '@/components/StageTypeBadge';
import TeamCard from '@/components/TeamCard';
import TeamForm from '@/components/TeamForm';

type TeamWithUnits = Team & { units: TeamUnit[] };

interface StageDetailClientProps {
  stageId: string;
}

export default function StageDetailClient({ stageId }: StageDetailClientProps) {
  const [stage, setStage] = useState<Stage | null>(null);
  const [teams, setTeams] = useState<TeamWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch stage
      const { data: stageData } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (stageData) setStage(stageData as Stage);

      // Fetch teams with units
      const { data: teamsData } = await (supabase as any)
        .from('teams')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });

      if (teamsData && teamsData.length > 0) {
        // Fetch units for all teams
        const teamIds = (teamsData as Team[]).map((t) => t.id);
        const { data: unitsData } = await (supabase as any)
          .from('team_units')
          .select('*')
          .in('team_id', teamIds);

        // Combine teams with their units
        const teamsWithUnits = (teamsData as Team[]).map((team) => ({
          ...team,
          units: ((unitsData as TeamUnit[]) || []).filter((u) => u.team_id === team.id),
        }));

        setTeams(teamsWithUnits);
      }

      setLoading(false);
    }

    fetchData();
  }, [stageId]);

  // Sort teams
  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-optc-text-secondary text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-optc-text-secondary py-20">Stage not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-optc-text-secondary">
          <li>
            <Link href="/stages" className="hover:text-optc-text transition-colors">
              Stages
            </Link>
          </li>
          <li>/</li>
          <li className="text-optc-text truncate">{stage.name}</li>
        </ol>
      </nav>

      {/* Stage header */}
      <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-optc-bg-hover border border-optc-border
                        flex items-center justify-center flex-shrink-0 overflow-hidden">
            {stage.image_url ? (
              <img src={stage.image_url} alt={stage.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">☠️</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-optc-text">{stage.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StageTypeBadge type={stage.type} size="md" />
              {stage.difficulty && (
                <span className="text-sm text-optc-text-secondary bg-optc-bg-hover px-3 py-1 rounded-full">
                  {stage.difficulty}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-optc-text-secondary">
              {stage.is_global && <span>🌍 Global</span>}
              {stage.is_japan && <span>🇯🇵 Japan</span>}
              <span>&bull; {teams.length} team{teams.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit team form */}
      <div className="mt-8">
        <TeamForm stage={stage} />
      </div>

      {/* Teams list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-optc-text">
            Teams ({teams.length})
          </h2>
          {teams.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-optc-text-secondary">Sort:</span>
              <button
                onClick={() => setSortBy('date')}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  sortBy === 'date'
                    ? 'bg-optc-accent text-white'
                    : 'text-optc-text-secondary hover:text-optc-text'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  sortBy === 'name'
                    ? 'bg-optc-accent text-white'
                    : 'text-optc-text-secondary hover:text-optc-text'
                }`}
              >
                Name
              </button>
            </div>
          )}
        </div>

        {sortedTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-4">🏴‍☠️</p>
            <p className="text-optc-text font-semibold">No teams submitted yet</p>
            <p className="text-optc-text-secondary text-sm mt-2">
              Be the first to share a team for this stage!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
