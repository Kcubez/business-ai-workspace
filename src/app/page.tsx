'use client';

import { MonthComparisonChart } from '@/components/charts/month-comparison-chart';
import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { useState } from 'react';
import { useIndustry } from '@/context/industry-context';
import { MultiSeriesLineChart, DonutPieChart } from '@/components/charts/premium-charts';
import {
  TrendingUp,
  Bot,
  ArrowRight,
  Sparkles,
  Clock,
  CircleDollarSign,
  ChevronRight,
  PieChart,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { formatPercent, percentage, categoryShares } from '@/lib/metrics';
import { TablePagination } from '@/components/ui/table-pagination';
import { SmartSuggestionsBanner } from '@/components/dashboard/smart-suggestions-banner';

import { useInsights } from '@/lib/use-insights';

export default function DashboardOverviewPage() {
  const {
    currentIndustry,
    dateRangeLabel,
    periodMode,
  } = useIndustry();
  const [sourceChartMode, setSourceChartMode] = useState<'pie' | 'bars'>('pie');
  const [queuePage, setQueuePage] = useState(1);
  const queuePageSize = 10;

  const { queueItems } = currentIndustry;
  const { insights: aiBriefs } = useInsights();
  const metrics = useReportingMetrics();
  const shares = categoryShares(metrics.incomeCategories.map(item => item.value));
  const revenueSources = metrics.incomeCategories.map((item, index) => ({
    ...item, rank: index + 1, percent: shares[index],
    shareText: formatPercent(shares[index]),
    amountText: item.value.toLocaleString() + ' MMK',
  }));
  const primaryRevenueSource = revenueSources[0];
  const stats = {
    revenueTodaySub: 'Income transactions in selected period',
    primaryMetricTitle: 'Demand Records', primaryMetricSub: 'Created in selected period',
    secondaryMetricTitle: 'Open Records', secondaryMetricSub: 'Selected records not yet closed',
    efficiencyMetricTitle: 'Overall Win Rate', efficiencyMetricValue: formatPercent(metrics.winRate),
    efficiencyMetricSub: 'Closed ÷ all selected demand records',
  };

  const totalQueuePages = Math.ceil(queueItems.length / queuePageSize) || 1;
  const validQueuePage = Math.min(queuePage, totalQueuePages);
  const paginatedQueueItems = queueItems.slice((validQueuePage - 1) * queuePageSize, validQueuePage * queuePageSize);

  const actualRev = metrics.revenue, salesTarg = metrics.salesTarget;
  const actualVol = metrics.expense, volTarg = metrics.expenseBudget;
  const revenueProgress = percentage(actualRev, salesTarg) ?? 0;
  const volumeProgress = percentage(actualVol, volTarg) ?? 0;
  const scaledTrend = metrics.trend;
  const scaledRevCard = metrics.revenue;
  const scaledPrimaryCard = metrics.leads;
  const scaledSecondaryCard = metrics.active;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentIndustry.name} Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {currentIndustry.tagline}
          </p>
        </PageHeadingCopy>

        {/* Planning Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/planning"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            style={{ backgroundColor: currentIndustry.color }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 90-Day Plan</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 - Revenue */}
        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold">
              {`Revenue (${periodMode.toUpperCase()})`}
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${currentIndustry.color}15`,
                color: currentIndustry.color,
              }}
            >
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white tracking-tight">
            {scaledRevCard.toLocaleString()} MMK
          </div>
          <div
            className="text-xs font-medium leading-relaxed"
            style={{ color: currentIndustry.color }}
          >
            {stats.revenueTodaySub}
          </div>
        </div>

        {/* Metric 2 - Primary Volume */}
        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold">{stats.primaryMetricTitle}</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${currentIndustry.color}15`,
                color: currentIndustry.color,
              }}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white tracking-tight">
            {scaledPrimaryCard.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {stats.primaryMetricSub}
          </div>
        </div>

        {/* Metric 3 - Secondary Metric */}
        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold">{stats.secondaryMetricTitle}</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${currentIndustry.color}15`,
                color: currentIndustry.color,
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white tracking-tight">
            {scaledSecondaryCard.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {stats.secondaryMetricSub}
          </div>
        </div>

        {/* Metric 4 - Efficiency */}
        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold">{stats.efficiencyMetricTitle}</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${currentIndustry.color}15`,
                color: currentIndustry.color,
              }}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white tracking-tight">
            {stats.efficiencyMetricValue}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {stats.efficiencyMetricSub}
          </div>
        </div>
      </div>

      {/* AI Smart Suggestions (Collapsible Heuristic Alerts) */}
      <SmartSuggestionsBanner />

      {/* Target Pacing Progress Bar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Revenue Target Attainment
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {actualRev.toLocaleString()} MMK / {salesTarg.toLocaleString()} MMK
              </div>
            </div>
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
              {formatPercent(percentage(actualRev, salesTarg))}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, revenueProgress)}%`,
                backgroundColor: currentIndustry.color,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>Calendar-prorated target for selected period</span>
            <span className="font-semibold">{actualRev >= salesTarg && salesTarg > 0 ? 'Target reached' : 'Below target'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expense Budget Usage
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {actualVol.toLocaleString()} / {volTarg.toLocaleString()} MMK
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatPercent(percentage(actualVol, volTarg))}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, volumeProgress)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>Calendar-prorated expense budget</span>
            <span className="font-semibold">{actualVol > volTarg ? 'Over budget' : 'Within budget'}</span>
          </div>
        </div>
      </div>

      {/* Financial overview: trend, sources and AI actions, then the operational queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full-width financial trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue & Expenses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recorded financial totals for {dateRangeLabel}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentIndustry.color }}
                />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Expenses</span>
              </div>
            </div>
          </div>

          <MultiSeriesLineChart
            data={scaledTrend}
            range={metrics.range}
            revenueColor={currentIndustry.color}
            expenseColor="#94a3b8"
          />
        </div>

        <MonthComparisonChart industry={currentIndustry} range={metrics.range} />

        {/* Revenue Sources */}
        <div className="flex min-w-0 flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revenue Sources
                </h3>
                <span className="text-[11px] font-medium text-slate-400">Top Service Streams</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSourceChartMode('pie')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    sourceChartMode === 'pie'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Donut / Pie Chart View"
                >
                  <PieChart className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSourceChartMode('bars')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    sourceChartMode === 'bars'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="List & Progress Bar View"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Sector share breakdown across current billing period
            </p>

            {sourceChartMode === 'pie' ? (
              <div className="pt-2">
                <DonutPieChart
                  data={revenueSources.map((item, idx) => {
                    const colors = [
                      currentIndustry.color,
                      '#0ea5e9',
                      '#10b981',
                      '#f59e0b',
                      '#8b5cf6',
                      '#ec4899',
                    ];
                    return {
                      name: item.name,
                      value: item.value,
                      color: colors[idx % colors.length],
                    };
                  })}
                  legendMaxHeight={200}
                  compact
                  size={140}
                  innerRadiusRatio={0.62}
                  centerTitle="Revenue"
                  centerSub="Recorded income"
                  unit="MMK"
                />
              </div>
            ) : (
              <div role="region" aria-label="Revenue source comparison" tabIndex={0} className="max-h-64 space-y-4 overflow-y-auto pr-2 overscroll-contain">
                {revenueSources.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {item.rank}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 break-words">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                        {item.amountText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: currentIndustry.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {item.shareText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {primaryRevenueSource && (
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Top source
                  </p>
                  <p className="mt-1 break-words text-xs font-bold text-slate-800 dark:text-slate-100">
                    {primaryRevenueSource.name}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Revenue share
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                    {primaryRevenueSource.shareText}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/finance"
            className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <span>View detailed ledger in Finance Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Full-width operational queue, placed below the supporting insights */}
        <div className="lg:col-span-2 lg:order-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentIndustry.queueTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentIndustry.queueSubtitle} · Demo snapshot: June 25, 2026 (not period-filtered)
              </p>
            </div>
            <Link
              href="/customer-service"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 font-semibold">{currentIndustry.queueColumns[0]}</th>
                  <th className="py-2.5 font-semibold">{currentIndustry.queueColumns[1]}</th>
                  <th className="py-2.5 font-semibold">{currentIndustry.queueColumns[2]}</th>
                  <th className="py-2.5 font-semibold text-right">{currentIndustry.queueColumns[3]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedQueueItems.map((item, idx) => {
                  const badgeClass =
                    item.statusType === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.statusType === 'warning'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : item.statusType === 'danger'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {item.col1}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {item.col2}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${badgeClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                        {item.col4}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 10-row Table Pagination */}
          <TablePagination
            currentPage={validQueuePage}
            totalItems={queueItems.length}
            pageSize={queuePageSize}
            onPageChange={setQueuePage}
          />
        </div>

        {/* AI Action Briefs */}
        <div className="lg:order-2 flex min-w-0 flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5" style={{ color: currentIndustry.color }} />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Smart Action Brief
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
              Rule-based suggestions for {currentIndustry.name}
          </p>

          <div role="region" aria-label="Smart action briefs" tabIndex={0} className="max-h-80 space-y-3 overflow-y-auto pr-1 overscroll-contain">
            {aiBriefs.length === 0 && <p className="text-xs text-slate-500">No suggestions triggered by the current records and period.</p>}
            {aiBriefs.map((brief, i) => {
              const isUrgent = brief.severity === 'urgent';
              const isWarning = brief.severity === 'warning';

              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-all ${
                    isUrgent
                      ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
                      : isWarning
                      ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
                      : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {brief.title}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {brief.description}
                      </p>
                      <Link
                        href={brief.actionLink}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline pt-1"
                      >
                        <span>{brief.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keep the roadmap action close to its supporting messages. */}
          <Link
            href="/planning"
            className="mt-3 w-full shrink-0 py-2.5 rounded-xl text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            style={{ backgroundColor: currentIndustry.color }}
          >
            <span>Open Full 90-Day AI Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
