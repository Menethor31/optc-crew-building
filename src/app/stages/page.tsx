import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stages - OPTC Crew Building',
  description: 'Browse all OPTC stages: Raids, Coliseum, Treasure Map, Kizuna Clash, Arena, and more.',
};

// Dynamic import of the client component
import StagesPageClient from './StagesPageClient';

export default function StagesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-optc-text">Stages</h1>
            <p className="mt-2 text-optc-text-secondary">
              Browse all OPTC events and find teams to clear them.
            </p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-optc-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-optc-text-secondary text-sm">Loading stages...</p>
            </div>
          </div>
        </div>
      }
    >
      <StagesPageClient />
    </Suspense>
  );
}
