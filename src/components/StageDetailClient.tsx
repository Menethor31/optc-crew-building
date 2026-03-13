'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [sortBy, setSortBy] = useState<'votes' | 'date' | 'name'>('votes');
  const [searchQuery, setSearchQuery] = useState('');
  const [shipFilter, setShipFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: stageData } = await supabase
        .from('stages').select('*').eq('id', stageId).single();
      if (stageData) setStage(stageData as Stage);

      const { data: teamsData } = await (supabase as any)
        .from('teams').select('*').eq('stage_id', stageId)
        .order('created_at', { ascending: false });

      if (teamsData && teamsData.length > 0) {
        const teamIds = (teamsData as Team[]).map((t) => t.id);
        const { data: unitsData } = await (supabase as any)
          .from('team_units').select('*').in('team_id', teamIds);

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

  // Unique ships for filter
  const availableShips = useMemo(() => {
    const ships = new Set<string>();
    teams.forEach(t => { if (t.ship) ships.add(t.ship); });
    return Array.from(ships).sort();
  }, [teams]);

  // Filter and sort
  const filteredTeams = useMemo(() => {
    let result = [...teams];

    // Search by team name, submitted_by, or ship
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.submitted_by.toLowerCase().includes(q) ||
        (t.ship && t.ship.toLowerCase().includes(q))
      );
    }

    // Ship filter
    if (shipFilter) {
      result = result.filter(t => t.ship === shipFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'votes') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [teams, searchQuery, shipFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || shipFilter !== '';

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
          <li><Link href="/stages" className="hover:text-optc-text transition-colors">Stages</Link></li>
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
        {/* Header + controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-optc-text">
            Teams ({filteredTeams.length}{hasActiveFilters ? ` / ${teams.length}` : ''})
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-40 sm:w-48 bg-optc-bg border border-optc-border rounded-lg px-3 py-1.5 pl-8 text-optc-text placeholder-optc-text-secondary text-xs focus:outline-none focus:border-optc-accent"
              />
              <svg className="w-3.5 h-3.5 text-optc-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-optc-text-secondary hover:text-optc-text text-xs">✕</button>
              )}
            </div>

            {/* Ship filter */}
            {availableShips.length > 1 && (
              <select
                value={shipFilter}
                onChange={(e) => setShipFilter(e.target.value)}
                className="bg-optc-bg border border-optc-border rounded-lg px-2 py-1.5 text-xs text-optc-text focus:outline-none focus:border-optc-accent appearance-none cursor-pointer"
              >
                <option value="">All Ships</option>
                {availableShips.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            {/* Sort */}
            <div className="flex items-center gap-1 bg-optc-bg border border-optc-border rounded-lg p-0.5">
              {([['votes', '⭐'], ['date', '🕐'], ['name', 'A-Z']] as const).map(([key, label]) => (
                <button key={key}
                  onClick={() => setSortBy(key)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    sortBy === key ? 'bg-optc-accent text-white' : 'text-optc-text-secondary hover:text-optc-text'
                  }`}
                  title={`Sort by ${key}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-optc-text-secondary text-xs">Active filters:</span>
            {searchQuery && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-optc-accent/20 text-optc-accent flex items-center gap-1">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-white">✕</button>
              </span>
            )}
            {shipFilter && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                🚢 {shipFilter}
                <button onClick={() => setShipFilter('')} className="hover:text-white">✕</button>
              </span>
            )}
            <button onClick={() => { setSearchQuery(''); setShipFilter(''); }}
              className="text-[10px] text-optc-text-secondary hover:text-optc-text">Clear all</button>
          </div>
        )}

        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : teams.length > 0 ? (
          <div className="bg-optc-bg-card border border-optc-border rounded-2xl p-8 text-center">
            <p className="text-optc-text-secondary text-sm">No teams match your filters</p>
            <button onClick={() => { setSearchQuery(''); setShipFilter(''); }}
              className="mt-2 text-optc-accent text-sm hover:text-optc-accent-hover">Clear filters</button>
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
