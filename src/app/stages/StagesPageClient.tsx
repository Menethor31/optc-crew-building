'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stage, StageType } from '@/types/database';
import StageCard from '@/components/StageCard';
import StageFilters from '@/components/StageFilters';

const ITEMS_PER_PAGE = 20;

export default function StagesPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<StageType | 'All'>(
    (searchParams.get('type') as StageType) || 'All'
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all stages on mount
  useEffect(() => {
    async function fetchStages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching stages:', error);
      } else {
        setStages((data as Stage[]) || []);
      }
      setLoading(false);
    }
    fetchStages();
  }, []);

  // Read type from URL on mount
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedType(typeParam as StageType);
    }
  }, [searchParams]);

  // Filter stages
  const filteredStages = useMemo(() => {
    let result = stages;

    // Filter by type
    if (selectedType !== 'All') {
      result = result.filter((s) => s.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query) ||
          (s.difficulty && s.difficulty.toLowerCase().includes(query))
      );
    }

    return result;
  }, [stages, selectedType, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredStages.length / ITEMS_PER_PAGE);
  const paginatedStages = filteredStages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Update URL when type changes
  const handleTypeChange = (type: StageType | 'All') => {
    setSelectedType(type);
    if (type === 'All') {
      router.push('/stages', { scroll: false });
    } else {
      router.push(`/stages?type=${encodeURIComponent(type)}`, { scroll: false });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-optc-text">Stages</h1>
        <p className="mt-2 text-optc-text-secondary">
          Browse all OPTC events and find teams to clear them.
        </p>
      </div>

      {/* Filters */}
      <StageFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        resultCount={filteredStages.length}
        totalCount={stages.length}
      />

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-optc-text-secondary text-sm">Loading stages...</p>
          </div>
        </div>
      )}

      {/* Results grid */}
      {!loading && (
        <>
          {paginatedStages.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginatedStages.map((stage) => (
                <StageCard key={stage.id} stage={stage} />
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-optc-text font-semibold">No stages found</p>
              <p className="text-optc-text-secondary text-sm mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-optc-bg-card border border-optc-border
                         text-optc-text-secondary hover:text-optc-text hover:border-optc-border-light
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                        ${currentPage === pageNum
                          ? 'bg-optc-accent text-white'
                          : 'bg-optc-bg-card border border-optc-border text-optc-text-secondary hover:text-optc-text'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-optc-bg-card border border-optc-border
                         text-optc-text-secondary hover:text-optc-text hover:border-optc-border-light
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                Next →
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <p className="text-center text-optc-text-secondary text-xs mt-3">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </>
      )}
    </div>
  );
}
