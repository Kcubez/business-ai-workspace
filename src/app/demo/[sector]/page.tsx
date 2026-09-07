import { notFound } from 'next/navigation';
import { DemoSectorDashboard } from './sector-dashboard';
import { demoSlugToIndustry } from '@/lib/sector-page-copy';

export function generateStaticParams() {
  return Object.keys(demoSlugToIndustry).map((sector) => ({ sector }));
}

export default async function DemoSectorPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const industryId = demoSlugToIndustry[sector];

  if (!industryId) notFound();

  return <DemoSectorDashboard industryId={industryId} />;
}
