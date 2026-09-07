'use client';
import { useIndustry } from '@/context/industry-context';
import { calculateMetrics, reportingRange } from './metrics';

export function useReportingMetrics() {
  const context = useIndustry();
  const range = reportingRange(context);
  return { ...calculateMetrics(context.currentIndustry, range), range };
}
