import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StageCard from '@/components/StageCard';
import StageTypeBadge from '@/components/StageTypeBadge';
import { Stage, STAGE_TYPES } from '@/types/database';

export const revalidate = 60; // Revalidate every 60 seconds

async function getRecentStages(): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching stages:', error);
    return [];
  }
  return (data as Stage[]) || [];
}

async function getStageCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('stages')
    .select('type');

  if (error) return {};

  const counts: Record<string, number> = {};
  (data as { type: string }[]).forEach((stage) => {
    counts[stage.type] = (counts[stage.type] || 0) + 1;
  });
  return counts;
}

export default async function HomePage() {
  const [recentStages, stageCounts] = await Promise.all([
    getRecentStages(),
    getStageCounts(),
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

      {/* Coming Soon / Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-optc-text mb-3">🚧 More Features Coming Soon</h2>
          <p className="text-optc-text-secondary max-w-lg mx-auto">
            Team sharing, box management, team matching, and AI-powered suggestions
            are in development. Stay tuned!
          </p>
        </div>
      </section>
    </div>
  );
}
