'use client';

import { useIndustry } from '@/context/industry-context';
import { reportingRange } from './metrics';
import { calculateInsights } from './insights';

export function useInsights() {
  const context = useIndustry();
  const range = reportingRange(context);
  return { insights: calculateInsights(context.currentIndustry, range), range };
}
