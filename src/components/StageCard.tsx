import Link from 'next/link';
import { Stage } from '@/types/database';
import StageTypeBadge from './StageTypeBadge';

interface StageCardProps {
  stage: Stage;
}

export default function StageCard({ stage }: StageCardProps) {
  return (
    <Link href={`/stages/${stage.id}`}>
      <div className="stage-card bg-optc-bg-card border border-optc-border rounded-xl p-4
                      hover:border-optc-accent/40 cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Boss portrait placeholder */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-optc-bg-hover border border-optc-border
                        flex items-center justify-center flex-shrink-0 overflow-hidden
                        group-hover:border-optc-accent/30 transition-colors">
            {stage.image_url ? (
              <img
                src={stage.image_url}
                alt={stage.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl sm:text-3xl">☠️</span>
            )}
          </div>

          {/* Stage info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-optc-text font-semibold text-sm sm:text-base truncate
                         group-hover:text-optc-accent-hover transition-colors">
              {stage.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StageTypeBadge type={stage.type} />
              {stage.difficulty && (
                <span className="text-xs text-optc-text-secondary bg-optc-bg-hover
                             px-2 py-0.5 rounded-full">
                  {stage.difficulty}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-optc-text-secondary">
              {stage.is_global && (
                <span className="flex items-center gap-1">
                  🌍 Global
                </span>
              )}
              {stage.is_japan && (
                <span className="flex items-center gap-1">
                  🇯🇵 Japan
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="text-optc-text-secondary group-hover:text-optc-accent transition-colors
                        flex-shrink-0 self-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
