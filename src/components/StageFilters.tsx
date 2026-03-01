'use client';

import { StageType, STAGE_TYPES, STAGE_TYPE_COLORS } from '@/types/database';

interface StageFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: StageType | 'All';
  onTypeChange: (type: StageType | 'All') => void;
  resultCount: number;
  totalCount: number;
}

export default function StageFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  resultCount,
  totalCount,
}: StageFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-optc-text-secondary" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search stages... (e.g. Kaido, Mihawk, Dressrosa)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-optc-bg-card border border-optc-border rounded-xl pl-12 pr-4 py-3
                   text-optc-text placeholder-optc-text-secondary text-sm
                   focus:outline-none focus:border-optc-accent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-optc-text-secondary
                     hover:text-optc-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
            ${selectedType === 'All'
              ? 'bg-optc-accent text-white'
              : 'bg-optc-bg-card border border-optc-border text-optc-text-secondary hover:text-optc-text hover:border-optc-border-light'
            }`}
        >
          All ({totalCount})
        </button>
        {STAGE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${selectedType === type
                ? `${STAGE_TYPE_COLORS[type]} text-white`
                : 'bg-optc-bg-card border border-optc-border text-optc-text-secondary hover:text-optc-text hover:border-optc-border-light'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="text-sm text-optc-text-secondary">
        {resultCount === totalCount ? (
          <span>Showing all {totalCount} stages</span>
        ) : (
          <span>
            Showing {resultCount} of {totalCount} stages
            {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
          </span>
        )}
      </div>
    </div>
  );
}
