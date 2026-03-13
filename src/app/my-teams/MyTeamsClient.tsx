'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, TeamUnit, Stage } from '@/types/database';
import { getMyTeamIds } from '@/lib/myTeams';
import TeamCard from '@/components/TeamCard';

type TeamWithUnits = Team & { units: TeamUnit[]; stageName?: string };

export default function MyTeamsClient() {
  const [teams, setTeams] = useState<TeamWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasIds, setHasIds] = useState(false);

  useEffect(() => {
    async function fetchMyTeams() {
      setLoading(true);
      const myIds = getMyTeamIds();
      setHasIds(myIds.length > 0);

      if (myIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch teams
      const { data: teamsData } = await (supabase as any)
        .from('teams')
        .select('*')
        .in('id', myIds)
        .order('created_at', { ascending: false });

      if (!teamsData || teamsData.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch units
      const teamIds = (teamsData as Team[]).map(t => t.id);
      const { data: unitsData } = await (supabase as any)
        .from('team_units')
        .select('*')
        .in('team_id', teamIds);

      // Fetch stage names
      const stageIds = Array.from(new Set((teamsData as Team[]).map(t => t.stage_id)));
      const { data: stagesData } = await supabase
        .from('stages')
        .select('id, name')
        .in('id', stageIds);

      const stageMap: Record<string, string> = {};
      if (stagesData) {
        (stagesData as { id: string; name: string }[]).forEach(s => { stageMap[s.id] = s.name; });
      }

      const teamsWithUnits: TeamWithUnits[] = (teamsData as Team[]).map(team => ({
        ...team,
        units: ((unitsData as TeamUnit[]) || []).filter(u => u.team_id === team.id),
        stageName: stageMap[team.stage_id] || '',
      }));

      setTeams(teamsWithUnits);
      setLoading(false);
    }

    fetchMyTeams();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-optc-text">My Teams</h1>
        <p className="mt-2 text-optc-text-secondary text-sm">
          Teams you&apos;ve created from this browser. Tracked via local storage.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasIds ? (
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">🏴‍☠️</p>
          <p className="text-optc-text font-semibold">No teams created yet</p>
          <p className="text-optc-text-secondary text-sm mt-2">
            When you submit a team on a stage page, it will appear here.
          </p>
          <Link href="/stages" className="inline-block mt-4 px-6 py-2 bg-optc-accent hover:bg-optc-accent-hover text-white font-medium rounded-xl text-sm transition-colors">
            Browse Stages
          </Link>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-8 text-center">
          <p className="text-optc-text-secondary text-sm">
            Your saved teams were not found in the database. They may have been deleted.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-optc-text-secondary">
            <span>{teams.length} team{teams.length !== 1 ? 's' : ''} created</span>
            <span>&bull;</span>
            <span>{teams.reduce((sum, t) => sum + (t.score || 0), 0)} total votes</span>
          </div>

          {/* Teams grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {teams.map((team) => (
              <div key={team.id} className="relative">
                {/* Stage badge */}
                {team.stageName && (
                  <div className="mb-1">
                    <Link href={`/stages/${team.stage_id}`}
                      className="text-[10px] text-optc-accent hover:text-optc-accent-hover font-medium">
                      📍 {team.stageName}
                    </Link>
                  </div>
                )}
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
