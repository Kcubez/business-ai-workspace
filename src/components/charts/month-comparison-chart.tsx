'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { IndustryConfig } from '@/data/industries';
import type { ReportingRange } from '@/lib/metrics';
import { monthComparison } from '@/lib/month-comparison';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const monthName = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function MonthComparisonChart({ industry, range }: { industry: IndustryConfig; range: ReportingRange }) {
  const titleId = useId();
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [range.valid, range.to, industry.financeTransactions]);
  const comparison = monthComparison(industry, range);
  if (!comparison) return null;
  const { current, previous, fullMonth } = comparison;
  const series = [
    { key: 'revenue' as const, label: 'Revenue' },
    { key: 'expenses' as const, label: 'Expenses' },
    { key: 'profit' as const, label: 'Net profit' },
  ];
  const values = series.flatMap(item => [current[item.key], previous[item.key]]);
  const low = Math.min(0, ...values), high = Math.max(0, ...values);
  const span = high - low || 1;
  const min = low < 0 ? low - span * 0.12 : 0;
  const max = high + span * 0.16;
  const height = width < 640 ? 280 : 360;
  const left = width < 640 ? 42 : 66;
  const plotWidth = Math.max(1, width - left - 16);
  const groupWidth = plotWidth / 3;
  const barWidth = Math.min(64, groupWidth * 0.27);
  const barGap = width < 640 ? 5 : 10;
  const y = (value: number) => 30 + (max - value) / (max - min) * (height - 78);
  const zero = y(0);
  const active = activeIndex === null ? null : series[activeIndex];
  const changeText = (key: 'revenue' | 'expenses' | 'profit') => {
    const before = previous[key], delta = current[key] - before;
    if (!current.count || !previous.count) return 'Change unavailable · missing records';
    if (delta === 0) return 'No change';
    return before > 0 ? `${delta > 0 ? '+' : ''}${(delta / before * 100).toFixed(1)}% vs previous month` : `${delta > 0 ? '+' : ''}${delta.toLocaleString()} MMK · ${before === 0 ? 'zero baseline' : 'previous loss'}`;
  };
  const tooltipWidth = Math.min(280, width);
  const activeCenter = left + groupWidth * ((activeIndex ?? 0) + 0.5);
  const rightPosition = activeCenter + barWidth + barGap + 16;
  const preferredPosition = rightPosition + tooltipWidth <= width
    ? rightPosition
    : activeCenter - barWidth - barGap - 16 - tooltipWidth;
  const tooltipLeft = Math.max(0, Math.min(width - tooltipWidth, preferredPosition));
  return (
    <section aria-labelledby={titleId} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">This Month vs Last Month</h3>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{fullMonth ? 'Full-month comparison' : 'Month-to-date comparison'} · {monthName(current.from)} vs {monthName(previous.from)} · MMK</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-sm bg-slate-400" />{monthName(previous.from)}</span>
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: industry.color }} />{monthName(current.from)}</span>
        </div>
      </div>
      {!current.count && !previous.count ? <p className="py-16 text-center text-sm text-slate-500">No recorded transactions in either comparison period.</p> : (
        <>
          <div ref={chartRef} className="relative mt-6 w-full min-w-0">
            <svg viewBox={`0 0 ${width} ${height}`} style={{ height }} className="block w-full" role="group" aria-label="Revenue, expenses, and net profit by month. Hover, tap, or focus a metric to inspect exact amounts and changes.">
              {activeIndex !== null && (
                <rect x={left + groupWidth * activeIndex + 4} y="14" width={Math.max(1, groupWidth - 8)} height={height - 44} rx="10" className="fill-slate-50 dark:fill-slate-800/50" pointerEvents="none" />
              )}
              {[0, 1, 2, 3, 4].map(tick => {
                const value = min + (max - min) * tick / 4;
                return <g key={tick}><line x1={left} x2={width - 16} y1={y(value)} y2={y(value)} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="3 5" /><text x={left - 10} y={y(value) + 4} textAnchor="end" className="fill-slate-500" fontSize={width < 640 ? 10 : 12}>{compact.format(value)}</text></g>;
              })}
              <line x1={left} x2={width - 16} y1={zero} y2={zero} className="stroke-slate-400 dark:stroke-slate-500" />
              {series.map((item, index) => {
                const x = left + groupWidth * (index + 0.5);
                return <g key={item.key}>
                  {[previous, current].map((period, i) => {
                    const value = period[item.key];
                    const barX = x - barGap / 2 - barWidth + i * (barWidth + barGap);
                    return <g key={i}>
                      <rect x={barX} y={Math.min(y(value), zero)} width={barWidth} height={Math.max(Math.abs(y(value) - zero), 1)} rx="5" fill={i ? industry.color : '#94a3b8'}><title>{monthName(period.from)} · {item.label}: {period.count ? `${value.toLocaleString()} MMK` : 'No recorded transactions'}</title></rect>
                      <text x={barX + barWidth / 2} y={value < 0 ? y(value) + 16 : y(value) - 9} textAnchor="middle" fontSize={width < 640 ? 10 : 12} fontWeight="600" className="fill-slate-600 dark:fill-slate-300">{period.count ? compact.format(value) : '—'}</text>
                    </g>;
                  })}
                  <rect x={left + groupWidth * index} y="0" width={groupWidth} height={height}
                    fill="transparent" tabIndex={0} role="button" aria-label={`${item.label}. ${monthName(current.from)}: ${current[item.key].toLocaleString()} MMK. ${monthName(previous.from)}: ${previous[item.key].toLocaleString()} MMK. ${changeText(item.key)}`}
                    className="cursor-crosshair focus:outline-none focus-visible:stroke-sky-500"
                    onPointerMove={() => setActiveIndex(index)} onPointerDown={() => setActiveIndex(index)}
                    onPointerLeave={event => { if (event.pointerType !== 'touch') setActiveIndex(null); }}
                    onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)}
                    onKeyDown={event => {
                      if (event.key === 'Escape') setActiveIndex(null);
                      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveIndex(index); }
                    }}
                  />
                  <text pointerEvents="none" x={x} y={height - 10} textAnchor="middle" fontSize={width < 640 ? 11 : 14} className="fill-slate-600 dark:fill-slate-300">{item.label}</text>
                </g>;
              })}
            </svg>
            {active && activeIndex !== null && (
              <div role="status" className="absolute top-0 z-30 pointer-events-none rounded-xl bg-slate-950 text-white p-3 text-xs shadow-xl border border-slate-700" style={{ width: tooltipWidth, left: tooltipLeft }}>
                <div className="font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-2">{active.label}</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-2 text-slate-300"><span>{monthName(previous.from)}</span><span className="font-mono">{previous.count ? `${previous[active.key].toLocaleString()} MMK` : 'No records'}</span></div>
                  <div className="flex justify-between gap-2"><span style={{ color: industry.color }}>{monthName(current.from)}</span><span className="font-mono">{current.count ? `${current[active.key].toLocaleString()} MMK` : 'No records'}</span></div>
                  <div className="border-t border-slate-700 pt-1.5 text-slate-200">{changeText(active.key)}</div>
                </div>
              </div>
            )}
          </div>

        </>
      )}
    </section>
  );
}
