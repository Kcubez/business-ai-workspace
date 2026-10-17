'use client';

import { CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react';
import { Children, isValidElement, type ReactNode, type CSSProperties } from 'react';
import { useIndustry } from '@/context/industry-context';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function RecordSelect({ value, onValueChange, children, 'aria-label': label }: {
  value: string; onValueChange: (value: string) => void; children: ReactNode; 'aria-label': string;
}) {
  const { currentIndustry } = useIndustry();
  const options = Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ value?: string; children: string }>(child)) return [];
    return [{ value: child.props.value ?? child.props.children, label: child.props.children }];
  });
  const accent = { '--filter-accent': currentIndustry.color } as CSSProperties;
  return (
    <Select value={value} items={options} onValueChange={next => { if (next !== null) onValueChange(next); }}>
      <SelectTrigger aria-label={label} style={accent} className="h-10 data-[size=default]:h-10 w-full max-w-full gap-5 rounded-xl border-slate-200 bg-white px-3.5 text-xs text-slate-700 shadow-xs hover:border-slate-300 focus-visible:border-[var(--filter-accent)] focus-visible:ring-2 focus-visible:ring-[var(--filter-accent)]/20 sm:w-auto sm:min-w-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 [&_[data-slot=select-value]]:truncate [&>svg]:text-slate-400">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} sideOffset={6} style={accent} className="max-h-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-0 dark:border-slate-700 dark:bg-slate-900">
        {options.map(option => <SelectItem key={option.value} value={option.value} className="min-h-9 cursor-pointer rounded-lg py-2 pl-3 pr-9 text-xs text-slate-700 data-highlighted:bg-slate-100 data-selected:bg-slate-50 data-selected:text-[var(--filter-accent)] dark:text-slate-200 dark:data-highlighted:bg-slate-800 dark:data-selected:bg-slate-800/60">{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}


export const recordFilterClass = 'min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export function RecordFilters({ search, onSearch, placeholder, children, onReset, count }: {
  search: string; onSearch: (value: string) => void; placeholder: string; children?: React.ReactNode; onReset: () => void; count: number;
}) {
  return <div className="mb-4 space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <input aria-label={placeholder} type="search" value={search} onChange={event => onSearch(event.target.value)} placeholder={placeholder} className={`${recordFilterClass} w-full sm:w-64`} />
      {children}
      <button type="button" onClick={onReset} className="min-h-10 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Reset filters</button>
    </div>
    <p role="status" className="text-xs text-slate-500">{count} matching {count === 1 ? 'record' : 'records'}</p>
  </div>;
}

export function AttentionPanel({ children, subtitle, title, chartTitle, reviewTitle, data }: {
  children: ReactNode; subtitle: string; title: string; chartTitle: string; reviewTitle: string;
  data: { label: string; value: number; color: string; onSelect: () => void; selected: boolean }[];
}) {
  const maximum = Math.max(1, ...data.map(item => item.value));
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="min-w-0 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"><BarChart3 className="size-4 text-slate-400" />{chartTitle}</h3>
        <div role="group" aria-label={chartTitle} className="max-h-60 space-y-1 overflow-y-auto pr-1">
          {data.length ? data.map(item => <button key={item.label} type="button" onClick={item.onSelect} aria-pressed={item.selected} className={`group w-full rounded-lg p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 ${item.selected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
            <span className="mb-2 flex items-baseline justify-between gap-3 text-xs"><span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span><span className="font-semibold tabular-nums text-slate-900 dark:text-white">{item.value}</span></span>
            <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-full rounded-full" style={{ width: `${item.value / maximum * 100}%`, backgroundColor: item.color }} /></span>
          </button>) : <p className="text-xs text-slate-500">No records to display.</p>}
        </div>
        <p className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">Select a bar to filter the table<ArrowRight className="size-3" /></p>
      </div>
      <div className="min-w-0 border-t border-slate-100 bg-slate-50/40 p-5 dark:border-slate-800 dark:bg-slate-950/20 lg:border-l lg:border-t-0">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{reviewTitle}</h3>
        <div className="max-h-60 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  </section>;
}

export function ClearAttention({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><CheckCircle2 className="size-5 shrink-0 text-emerald-500" /><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nothing to review</p><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{children}</p></div></div>;
}
