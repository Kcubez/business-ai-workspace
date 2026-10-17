import { categoryShares } from '@/lib/metrics';
import type { PieSlice } from './premium-charts';

export function CategoryBarChart({ data, unit = 'leads' }: { data: PieSlice[]; unit?: string }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const shares = categoryShares(sorted.map(item => item.value));
  const maximum = Math.max(...sorted.map(item => item.value), 1);
  if (!sorted.some(item => item.value > 0)) return <p className="py-12 text-center text-xs text-slate-500">No recorded data in this period</p>;
  return (
    <ul className="w-full min-w-0 space-y-5 py-2" aria-label={`Category comparison in ${unit}`}>
      {sorted.map((item, index) => (
        <li key={item.name} className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
            <span className="tabular-nums text-slate-500"><strong className="font-semibold text-slate-900 dark:text-white">{item.value.toLocaleString()} {unit}</strong> · {shares[index]}%</span>
          </div>
          <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full" style={{ width: `${item.value / maximum * 100}%`, backgroundColor: item.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
