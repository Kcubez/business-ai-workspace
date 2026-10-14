'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { categoryShares } from '@/lib/metrics';

interface ChartPoint {
  label: string;
  revenue: number;
  expense: number;
  profit: number;
}

const compactAmount = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function formatAxisDate(label: string) {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(label)) return label;
  const date = new Date(`${label.length === 7 ? `${label}-01` : label}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return label;
  return date.toLocaleDateString('en-GB', label.length === 7
    ? { month: 'short', year: '2-digit', timeZone: 'UTC' }
    : { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function MultiSeriesLineChart({
  data,
  revenueColor = '#0ea5e9',
  expenseColor = '#64748b',
  height = 240,
}: {
  data: ChartPoint[];
  revenueColor?: string;
  expenseColor?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const [width, setWidth] = useState(680);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(1, entry.contentRect.width));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const paddingLeft = 54;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 36;
  const plotWidth = Math.max(1, width - paddingLeft - paddingRight);
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = data.reduce((max, point) => Math.max(max, point.revenue, point.expense), 1);
  const magnitude = 10 ** Math.floor(Math.log10(maxVal));
  const chartMax = Math.ceil(maxVal * 1.1 / magnitude) * magnitude;
  const getX = (index: number) => paddingLeft + (data.length === 1 ? 0.5 : index / (data.length - 1)) * plotWidth;
  const getY = (value: number) => paddingTop + plotHeight - value / chartMax * plotHeight;
  const tickCount = Math.min(data.length, Math.max(2, Math.floor(plotWidth / 85) + 1));
  const tickIndices = new Set(Array.from({ length: tickCount }, (_, index) =>
    tickCount === 1 ? 0 : Math.round(index * (data.length - 1) / (tickCount - 1))));
  const activeIndex = hoveredIdx === null || !data.length ? null : Math.min(hoveredIdx, data.length - 1);
  const activePoint = activeIndex === null ? undefined : data[activeIndex];
  const showDots = data.length <= Math.min(18, Math.floor(plotWidth / 24));
  const revenuePath = data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.revenue)}`).join(' ');
  const expensePath = data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.expense)}`).join(' ');
  const revenueArea = `${revenuePath} L ${getX(data.length - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;
  const tooltipWidth = Math.min(260, width);
  const inspectPointer = (event: PointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    setHoveredIdx(Math.max(0, Math.min(data.length - 1, Math.round(position * (data.length - 1)))));
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-slate-400">No chart data available</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ height }} className="block w-full select-none" role="group" aria-label="Revenue and operating cost trend">
            <title>Revenue and operating cost trend. Focus the plot and use arrow keys to inspect dates.</title>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={revenueColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={revenueColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + plotHeight * (1 - ratio);
              return (
                <g key={ratio}>
                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} strokeDasharray="3 5" className="stroke-slate-200 dark:stroke-slate-800" />
                  <text x={paddingLeft - 10} y={y + 4} fontSize={11} textAnchor="end" className="fill-slate-400 font-mono">{compactAmount.format(chartMax * ratio)}</text>
                </g>
              );
            })}
            <path d={revenueArea} fill={`url(#${gradientId})`} />
            <path d={expensePath} fill="none" stroke={expenseColor} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
            <path d={revenuePath} fill="none" stroke={revenueColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {activeIndex !== null && (
              <line x1={getX(activeIndex)} x2={getX(activeIndex)} y1={paddingTop} y2={paddingTop + plotHeight} stroke={revenueColor} strokeOpacity="0.35" strokeDasharray="3 4" />
            )}
            {data.map((point, index) => (
              <g key={`${point.label}-${index}`}>
                {tickIndices.has(index) && (
                  <text x={getX(index)} y={height - 10} fontSize={11} textAnchor={data.length === 1 ? 'middle' : index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'} className="fill-slate-500 font-medium">
                    {formatAxisDate(point.label)}
                  </text>
                )}
                {(showDots || activeIndex === index) && (
                  <>
                    <circle cx={getX(index)} cy={getY(point.expense)} r={activeIndex === index ? 4 : 2.5} fill={expenseColor} />
                    <circle cx={getX(index)} cy={getY(point.revenue)} r={activeIndex === index ? 5 : 3} fill="white" stroke={revenueColor} strokeWidth="2" />
                  </>
                )}
              </g>
            ))}
            <rect
              x={paddingLeft} y={paddingTop} width={plotWidth} height={plotHeight}
              fill="transparent" className="cursor-crosshair outline-none focus:stroke-slate-400"
              tabIndex={0} role="slider" aria-label="Inspect chart dates"
              aria-valuemin={1} aria-valuemax={data.length} aria-valuenow={(activeIndex ?? 0) + 1}
              aria-valuetext={activePoint ? `${activePoint.label}: revenue ${activePoint.revenue.toLocaleString()} MMK, operating cost ${activePoint.expense.toLocaleString()} MMK, net profit ${activePoint.profit.toLocaleString()} MMK` : data[0].label}
              onPointerMove={inspectPointer} onPointerDown={inspectPointer}
              onPointerLeave={(event) => { if (event.pointerType !== 'touch') setHoveredIdx(null); }}
              onFocus={() => setHoveredIdx(0)} onBlur={() => setHoveredIdx(null)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
                event.preventDefault();
                if (event.key === 'Escape') setHoveredIdx(null);
                else if (event.key === 'Home') setHoveredIdx(0);
                else if (event.key === 'End') setHoveredIdx(data.length - 1);
                else setHoveredIdx(Math.max(0, Math.min(data.length - 1, (activeIndex ?? 0) + (event.key === 'ArrowRight' ? 1 : -1))));
              }}
            />
          </svg>
          {activePoint && activeIndex !== null && (
            <div role="status" className="absolute top-0 z-30 pointer-events-none rounded-xl bg-slate-950/95 text-white p-3 text-xs shadow-xl border border-slate-700" style={{ width: tooltipWidth, left: Math.max(0, Math.min(width - tooltipWidth, getX(activeIndex) - tooltipWidth / 2)) }}>
              <div className="font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-2">{activePoint.label}</div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2"><span style={{ color: revenueColor }}>Revenue</span><span className="font-mono">{activePoint.revenue.toLocaleString()} MMK</span></div>
                <div className="flex justify-between gap-2 text-slate-300"><span>Operating Cost</span><span className="font-mono">{activePoint.expense.toLocaleString()} MMK</span></div>
                <div className="flex justify-between gap-2 text-emerald-400 border-t border-slate-700 pt-1.5"><span>Net Profit</span><span className="font-mono">{activePoint.profit.toLocaleString()} MMK</span></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

export function DonutPieChart({
  data,
  size = 190,
  innerRadiusRatio = 0.62,
  centerTitle,
  centerSub,
  unit = 'leads',
  stacked = false,
}: {
  data: PieSlice[];
  size?: number;
  innerRadiusRatio?: number;
  centerTitle?: string;
  centerSub?: string;
  unit?: string;
  stacked?: boolean;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return <div className="flex min-h-40 items-center justify-center text-xs text-slate-500">No recorded data in this period</div>;
  }
  const radius = size / 2;
  const innerRadius = radius * innerRadiusRatio;
  const shares = categoryShares(data.map(item => item.value));

  const slices = data.map((slice, index) => {
    const angle = (slice.value / total) * 360;
    const startAngle = data
      .slice(0, index)
      .reduce((sum, previousSlice) => sum + (previousSlice.value / total) * 360, 0);
    const endAngle = startAngle + angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const x3 = radius + innerRadius * Math.cos(endRad);
    const y3 = radius + innerRadius * Math.sin(endRad);
    const x4 = radius + innerRadius * Math.cos(startRad);
    const y4 = radius + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = slice.value === total
      ? `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${size} A ${radius} ${radius} 0 1 1 ${radius} 0 Z M ${radius} ${radius - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${radius} ${radius + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${radius} ${radius - innerRadius} Z`
      : "M " + x1 + " " + y1 + " A " + radius + " " + radius + " 0 " + largeArc + " 1 " + x2 + " " + y2 + " L " + x3 + " " + y3 + " A " + innerRadius + " " + innerRadius + " 0 " + largeArc + " 0 " + x4 + " " + y4 + " Z";

    const percent = shares[index];

    return {
      ...slice,
      path,
      percent,
    };
  });

  return (
    <div className={`flex ${stacked ? 'flex-col' : 'flex-col sm:flex-row'} items-center gap-5 select-none w-full`}>
      <div className="relative shrink-0 my-1" style={{ width: size, height: size }}>
        <svg viewBox={"0 0 " + size + " " + size} className="w-full h-full overflow-visible">
          {slices.map((s, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <path
                key={i}
                d={s.path}
                fill={s.color}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  transformOrigin: radius + "px " + radius + "px",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
          {hoveredIdx !== null && data[hoveredIdx] ? (
            <>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate max-w-[95px]">
                {data[hoveredIdx].name}
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-tight">
                {shares[hoveredIdx]}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[95px]">
                {data[hoveredIdx].value.toLocaleString()} {unit}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate max-w-[100px]">
                {centerTitle || 'Total'}
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-tight">
                {total.toLocaleString()}{unit === '%' ? '%' : ''}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                {centerSub || 'Distribution'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-1.5 flex-1 w-full min-w-0 max-h-[185px] overflow-y-auto pr-1 custom-scrollbar">
        {slices.map((s, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={
                "flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-xs " +
                (isHovered ? "bg-slate-100 dark:bg-slate-800/80 shadow-xs" : "hover:bg-slate-50 dark:hover:bg-slate-800/40")
              }
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
                  {s.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono shrink-0">
                {unit !== '%' && (
                  <span className="text-slate-400 font-medium text-[10px] hidden sm:inline">
                    {s.value.toLocaleString()} {unit}
                  </span>
                )}
                <span className="font-bold text-slate-900 dark:text-white min-w-[2.25rem] text-right text-[11px] sm:text-xs">
                  {s.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
