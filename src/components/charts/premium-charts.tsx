'use client';

import { useState } from 'react';
import { categoryShares } from '@/lib/metrics';

interface ChartPoint {
  label: string;
  revenue: number;
  expense: number;
  profit: number;
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No chart data available
      </div>
    );
  }

  const paddingLeft = 82;
  const paddingRight = 32;
  const paddingTop = 32;
  const paddingBottom = 35;
  const width = 680;

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.revenue, d.expense]),
    1
  );
  const chartMax = Math.ceil(maxVal * 1.15);

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (data.length === 1 ? 0.5 : index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return paddingTop + plotHeight - (val / chartMax) * plotHeight;
  };

  const revenuePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.revenue)}`)
    .join(' ');

  const expensePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.expense)}`)
    .join(' ');

  const revenueArea = `${revenuePath} L ${getX(data.length - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  const formatShort = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  return (
    <div className="relative w-full overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={revenueColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={revenueColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + plotHeight * (1 - ratio);
          const val = chartMax * ratio;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                className="dark:stroke-slate-800"
              />
              <text
                x={paddingLeft - 10}
                y={y + 3.5}
                fontSize="10"
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {formatShort(val)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={revenueArea} fill="url(#revenueGrad)" />

        {/* Expense Line */}
        <path
          d={expensePath}
          fill="none"
          stroke={expenseColor}
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Revenue Line */}
        <path
          d={revenuePath}
          fill="none"
          stroke={revenueColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & Labels */}
        {data.map((d, i) => {
          const x = getX(i);
          const yRev = getY(d.revenue);
          const yExp = getY(d.expense);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i}>
              {/* X Axis Label */}
              <text
                x={x}
                y={height - 8}
                fontSize="10"
                textAnchor="middle"
                className="fill-slate-500 font-medium text-[10px]"
              >
                {d.label}
              </text>

              {/* Expense dot */}
              <circle
                cx={x}
                cy={yExp}
                r={isHovered ? 4 : 2.5}
                fill={expenseColor}
                className="transition-all duration-150"
              />

              {/* Revenue dot */}
              <circle
                cx={x}
                cy={yRev}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke={revenueColor}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150 cursor-pointer"
              />

              {/* Interaction zone */}
              <rect
                x={x - plotWidth / (data.length * 2)}
                y={paddingTop}
                width={plotWidth / data.length}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip with boundary clamp */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className={`absolute z-30 pointer-events-none rounded-xl bg-slate-950/95 text-white p-3 text-xs shadow-2xl backdrop-blur-md border border-slate-700 whitespace-nowrap transition-all duration-75 ${
            hoveredIdx >= data.length - 2
              ? '-translate-x-full -translate-y-full ml-[-12px]'
              : hoveredIdx <= 1
              ? 'translate-x-0 -translate-y-full ml-[12px]'
              : '-translate-x-1/2 -translate-y-full'
          }`}
          style={{
            left: `${(getX(hoveredIdx) / width) * 100}%`,
            top: `${Math.max(12, (getY(data[hoveredIdx].revenue) / height) * 100 - 4)}%`,
          }}
        >
          <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-1.5 flex items-center justify-between gap-3">
            <span>{data[hoveredIdx].label}</span>
            <span className="text-[10px] text-slate-400">Financial Summary</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-sky-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Revenue</span>
              </span>
              <span className="font-mono font-semibold">
                {data[hoveredIdx].revenue.toLocaleString()} MMK
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Operating Cost</span>
              </span>
              <span className="font-mono font-semibold">
                {data[hoveredIdx].expense.toLocaleString()} MMK
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400 pt-1 border-t border-slate-800">
              <span className="font-medium">Net Profit</span>
              <span className="font-mono font-bold">
                {data[hoveredIdx].profit.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>
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
