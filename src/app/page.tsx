import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StageCard from '@/components/StageCard';
import StageTypeBadge from '@/components/StageTypeBadge';
import { Stage, Team, TeamUnit, STAGE_TYPES } from '@/types/database';
import TeamCard from '@/components/TeamCard';

export const revalidate = 60;

type TeamWithUnits = Team & { units: TeamUnit[] };

async function getRecentStages(): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) { console.error('Error fetching stages:', error); return []; }
  return (data as Stage[]) || [];
}

async function getStageCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('stages').select('type');
  if (error) return {};
  const counts: Record<string, number> = {};
  (data as { type: string }[]).forEach((stage) => {
    counts[stage.type] = (counts[stage.type] || 0) + 1;
  });
  return counts;
}

async function getRecentTeams(): Promise<TeamWithUnits[]> {
  const { data: teamsData, error } = await (supabase as any)
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !teamsData || teamsData.length === 0) return [];

  const teamIds = (teamsData as Team[]).map(t => t.id);
  const { data: unitsData } = await (supabase as any)
    .from('team_units')
    .select('*')
    .in('team_id', teamIds);

  return (teamsData as Team[]).map(team => ({
    ...team,
    units: ((unitsData as TeamUnit[]) || []).filter(u => u.team_id === team.id),
  }));
}

export default async function HomePage() {
  const [recentStages, stageCounts, recentTeams] = await Promise.all([
    getRecentStages(),
    getStageCounts(),
    getRecentTeams(),
  ]);

  const totalStages = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-optc-accent/10 via-transparent to-optc-blue/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-optc-text">
              Build Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-optc-accent to-optc-accent-hover">
                Dream Crew
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-optc-text-secondary max-w-2xl mx-auto">
              Find and share teams for One Piece Treasure Cruise. Browse community strategies
              for Raids, Coliseum, Treasure Map, Kizuna Clash, and more.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/stages"
                className="w-full sm:w-auto px-8 py-3 bg-optc-accent hover:bg-optc-accent-hover
                         text-white font-semibold rounded-xl transition-colors text-center"
              >
                Browse Stages
              </Link>
              <div className="text-optc-text-secondary text-sm">
                {totalStages} stages available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Teams */}
      {recentTeams.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-optc-text">Latest Teams</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {recentTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      )}

      {/* Stage Types Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-optc-text mb-6">Browse by Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {STAGE_TYPES.filter((type) => stageCounts[type]).map((type) => (
            <Link
              key={type}
              href={`/stages?type=${encodeURIComponent(type)}`}
              className="bg-optc-bg-card border border-optc-border rounded-xl p-4
                       hover:border-optc-accent/40 transition-all group text-center"
            >
              <StageTypeBadge type={type} size="md" />
              <p className="mt-2 text-optc-text-secondary text-sm group-hover:text-optc-text transition-colors">
                {stageCounts[type]} stage{stageCounts[type] > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Stages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-optc-text">Recent Stages</h2>
          <Link
            href="/stages"
            className="text-optc-accent hover:text-optc-accent-hover text-sm font-medium
                     transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentStages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </section>
    </div>
  );
}
