import TeamDetailClient from '@/components/TeamDetailClient';

interface PageProps {
  params: { id: string };
}

export default function TeamDetailPage({ params }: PageProps) {
  return <TeamDetailClient teamId={params.id} />;
}
