'use client';

import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { useIndustry } from '@/context/industry-context';
import { CheckCircle2 } from 'lucide-react';

export default function PlanningPage() {
  const { currentIndustry } = useIndustry();

  const planRoadmap = [
    {
      phase: 'Month 1 (Day 1 - 30): Operations Stabilizing',
      goal: `Eliminate service bottlenecks and optimize daily volume to reach ${currentIndustry.targets.volumeTarget} units.`,
      status: 'In Execution',
      initiatives: [
        'Shift resource allocation during peak 10:00 AM - 2:00 PM hours.',
        'Review supplier procurement pricing for top 3 high-spend categories.',
        'Set up standardized digital follow-up templates for customer inquiries.',
      ],
    },
    {
      phase: 'Month 2 (Day 31 - 60): Margin Expansion',
      goal: `Scale total revenue towards ${currentIndustry.targets.salesTarget.toLocaleString()} MMK while keeping expenses under budget.`,
      status: 'Upcoming',
      initiatives: [
        'Launch targeted loyalty / repeat purchase campaign.',
        'Bundle low-margin items with high-margin core offerings.',
        'Implement automated stock reorder triggers to prevent stockouts.',
      ],
    },
    {
      phase: 'Month 3 (Day 61 - 90): Full Automation & Expansion',
      goal: 'Achieve 90%+ automation across client follow-ups and routine reporting.',
      status: 'Planned',
      initiatives: [
        'Connect AI auto-responder for after-hours customer inquiries.',
        'Establish branch/channel comparative performance dashboard.',
        'Review quarterly executive ROI and dividend payout plan.',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">Strategic Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI 90-Day Operational Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Contextual growth roadmap and cost-optimization recommendations generated for {currentIndustry.name}.
          </p>
        </PageHeadingCopy>
      </div>

      <div className="space-y-4">
        {planRoadmap.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {item.phase}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[10px] font-semibold">
                {item.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              {item.goal}
            </h3>

            <div className="space-y-2">
              {item.initiatives.map((init, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{init}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
