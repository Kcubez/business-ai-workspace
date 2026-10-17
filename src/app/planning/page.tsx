'use client';

import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { useIndustry } from '@/context/industry-context';
import Link from 'next/link';
import { ArrowRight, CalendarRange, Circle, Layers3, ListChecks, Settings2, TrendingUp, Workflow } from 'lucide-react';

export default function PlanningPage() {
  const { currentIndustry } = useIndustry();

  const planRoadmap = [
    {
      phase: 'Stabilize operations',
      days: 'Days 1–30',
      focus: 'Build a reliable foundation',
      icon: Settings2,
      href: '/customer-service',
      action: 'Review follow-ups',
      goal: `Eliminate service bottlenecks and optimize daily volume to reach ${currentIndustry.targets.volumeTarget} units.`,
      status: 'First priority',
      initiatives: [
        'Shift resource allocation during peak 10:00 AM - 2:00 PM hours.',
        'Review supplier procurement pricing for top 3 high-spend categories.',
        'Set up standardized digital follow-up templates for customer inquiries.',
      ],
    },
    {
      phase: 'Improve margins',
      days: 'Days 31–60',
      focus: 'Strengthen financial performance',
      icon: TrendingUp,
      href: '/finance',
      action: 'Review finances',
      goal: `Scale total revenue towards ${currentIndustry.targets.salesTarget.toLocaleString()} MMK while keeping expenses under budget.`,
      status: 'Next phase',
      initiatives: [
        'Launch targeted loyalty / repeat purchase campaign.',
        'Bundle low-margin items with high-margin core offerings.',
        'Implement automated stock reorder triggers to prevent stockouts.',
      ],
    },
    {
      phase: 'Automate & expand',
      days: 'Days 61–90',
      focus: 'Prepare for sustainable growth',
      icon: Workflow,
      href: '/',
      action: 'Review overview',
      goal: 'Achieve 90%+ automation across client follow-ups and routine reporting.',
      status: 'Later phase',
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
            A phased plan to strengthen operations, improve margins, and prepare {currentIndustry.name} for growth.
          </p>
        </PageHeadingCopy>
      </div>

      <section aria-label="Roadmap overview" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your next 90 days</h2>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Suggested sequence · initiatives are recommendations, not completed work.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2"><CalendarRange className="size-4" style={{ color: currentIndustry.color }} />90 days</span>
            <span className="flex items-center gap-2"><Layers3 className="size-4" style={{ color: currentIndustry.color }} />3 phases</span>
            <span className="flex items-center gap-2"><ListChecks className="size-4" style={{ color: currentIndustry.color }} />9 initiatives</span>
          </div>
        </div>
        <nav aria-label="Jump to roadmap phase" className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
          {planRoadmap.map((item, index) => (
            <a key={item.phase} href={`#phase-${index + 1}`} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 focus-visible:outline-2 dark:border-slate-800 dark:hover:bg-slate-800/50">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ color: currentIndustry.color, backgroundColor: `${currentIndustry.color}15` }}>0{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="block text-xs text-slate-500">{item.days}</span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{item.phase}</span></span>
              <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </nav>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3">
        {planRoadmap.map((item, index) => {
          const Icon = item.icon;
          return (
            <section id={`phase-${index + 1}`} aria-labelledby={`phase-title-${index + 1}`} key={item.phase} className="flex min-w-0 scroll-mt-40 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="h-1" style={{ backgroundColor: currentIndustry.color, opacity: index === 0 ? 1 : index === 1 ? 0.55 : 0.3 }} />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl" style={{ color: currentIndustry.color, backgroundColor: `${currentIndustry.color}15` }}><Icon className="size-5" /></span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300" style={index === 0 ? { color: currentIndustry.color, backgroundColor: `${currentIndustry.color}15` } : undefined}>{item.status}</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Month {index + 1} · {item.days}</p>
                <h2 id={`phase-title-${index + 1}`} className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">{item.phase}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.focus}</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 xl:min-h-36">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: currentIndustry.color }}>Objective</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">{item.goal}</p>
                </div>
                <h3 className="mt-5 text-xs font-semibold text-slate-900 dark:text-white">Key initiatives</h3>
                <ul className="mt-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {item.initiatives.map(initiative => (
                    <li key={initiative} className="flex items-start gap-2.5 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      <Circle aria-hidden="true" className="mt-1 size-3 shrink-0 text-slate-400" />
                      <span>{initiative}</span>
                    </li>
                  ))}
                </ul>
                <Link href={item.href} className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold transition-opacity hover:opacity-75 dark:border-slate-800" style={{ color: currentIndustry.color }}>{item.action}<ArrowRight className="size-4" /></Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
