import { StageType, STAGE_TYPE_COLORS } from '@/types/database';

interface StageTypeBadgeProps {
  type: StageType;
  size?: 'sm' | 'md';
}

export default function StageTypeBadge({ type, size = 'sm' }: StageTypeBadgeProps) {
  const colorClass = STAGE_TYPE_COLORS[type] || 'bg-gray-600';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`${colorClass} ${sizeClass} rounded-full text-white font-medium inline-block`}
    >
      {type}
    </span>
  );
}
