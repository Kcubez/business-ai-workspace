'use client';

import { useEffect } from 'react';
import DashboardOverviewPage from '@/app/page';
import { useIndustry } from '@/context/industry-context';
import type { IndustryId } from '@/data/industries';

export function DemoSectorDashboard({ industryId }: { industryId: IndustryId }) {
  const { currentIndustryId, setIndustryId } = useIndustry();

  useEffect(() => {
    if (currentIndustryId !== industryId) {
      queueMicrotask(() => setIndustryId(industryId));
    }
  }, [currentIndustryId, industryId, setIndustryId]);

  return <DashboardOverviewPage />;
}
