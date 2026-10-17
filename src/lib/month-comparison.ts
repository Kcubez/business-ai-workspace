import type { IndustryConfig } from '@/data/industries';
import { validDate, type ReportingRange } from './metrics';

export function monthComparison(industry: IndustryConfig, range: ReportingRange) {
  if (!range.valid || !validDate(range.to)) return null;
  const end = new Date(`${range.to}T00:00:00Z`);
  const year = end.getUTCFullYear(), month = end.getUTCMonth(), day = end.getUTCDate();
  const fullMonth = day === new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const previousLast = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const current = { from: iso(new Date(Date.UTC(year, month, 1))), to: range.to };
  const previous = { from: iso(new Date(Date.UTC(year, month - 1, 1))), to: iso(new Date(Date.UTC(year, month - 1, fullMonth ? previousLast : Math.min(day, previousLast)))) };
  const totals = (period: typeof current) => {
    const records = industry.financeTransactions.filter(t => t.date >= period.from && t.date <= period.to);
    const revenue = records.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = records.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { ...period, revenue, expenses, profit: revenue - expenses, count: records.length };
  };
  return { current: totals(current), previous: totals(previous), fullMonth };
}
