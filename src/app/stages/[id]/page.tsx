import StageDetailClient from '@/components/StageDetailClient';

interface PageProps {
  params: { id: string };
}

export default function StageDetailPage({ params }: PageProps) {
  return <StageDetailClient stageId={params.id} />;
}
