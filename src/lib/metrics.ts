import type { IndustryConfig } from '../data/industries';

// Legacy undated demand rows belong to this documented seed snapshot.
export const DEMO_SNAPSHOT_DATE = '2026-06-25';
export const DEMO_REPORT_END = '2026-09-07';
export type PeriodSelection = {
  periodMode: 'overall' | 'day' | 'month' | 'year' | 'custom';
  selectedYear: number; selectedMonthNum: number; selectedDay: number;
  customFrom: string; customTo: string;
};
export type ReportingRange = { from: string; to: string; valid: boolean; label: string; targetMonths: number };
const DAY = 86400000;
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function reportingRange(s: PeriodSelection): ReportingRange {
  const month = `${s.selectedYear}-${String(s.selectedMonthNum).padStart(2, '0')}`;
  let from = `${month}-01`, to = `${month}-${new Date(Date.UTC(s.selectedYear, s.selectedMonthNum, 0)).getUTCDate()}`;
  if (s.periodMode === 'day') from = to = `${month}-${String(s.selectedDay).padStart(2, '0')}`;
  if (s.periodMode === 'year') { from = `${s.selectedYear}-01-01`; to = `${s.selectedYear}-12-31`; }
  if (s.periodMode === 'overall') { from = '2024-01-01'; to = DEMO_REPORT_END; }
  if (s.periodMode === 'custom') { from = s.customFrom; to = s.customTo; }
  const valid = validDate(from) && validDate(to) && from <= to && from >= '2024-01-01' && from <= DEMO_REPORT_END;
  if (to > DEMO_REPORT_END) to = DEMO_REPORT_END;
  // Inclusive calendar-day proration of each month's configured budget.
  let targetMonths = 0;
  if (valid) {
    const cursor = new Date(`${from}T00:00:00Z`), end = new Date(`${to}T00:00:00Z`);
    while (cursor <= end) {
      const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
      const last = Math.min(monthEnd.getTime(), end.getTime());
      targetMonths += ((last - cursor.getTime()) / DAY + 1) / monthEnd.getUTCDate();
      cursor.setTime(last + DAY);
    }
  }
  return { from, to, valid, targetMonths, label: valid ? (from === to ? from : `${from} → ${to}`) : 'Invalid date range' };
}
export function inRange(date: string, range: ReportingRange) {
  return range.valid && validDate(date) && date >= range.from && date <= range.to;
}
export function demandDate(record: IndustryConfig['demandRecords'][number]) {
  return record.createdDate ?? DEMO_SNAPSHOT_DATE;
}
export function percentage(value: number, total: number): number | null {
  return total > 0 ? Math.round(value / total * 1000) / 10 : null;
}
export function formatPercent(value: number | null) { return value === null ? '—' : `${value}%`; }
// Largest-remainder rounding keeps displayed category shares at exactly 100%.
export function categoryShares(values: number[]): number[] {
  const total = values.reduce((n, value) => n + value, 0);
  if (total <= 0) return values.map(() => 0);
  const units = values.map(value => value / total * 1000);
  const rounded = units.map(Math.floor);
  const order = units.map((value, index) => ({ index, remainder: value - rounded[index] }))
    .sort((a, b) => b.remainder - a.remainder);
  const left = 1000 - rounded.reduce((n, value) => n + value, 0);
  for (let i = 0; i < left; i++) rounded[order[i].index]++;
  return rounded.map(value => value / 10);
}
export function calculateMetrics(industry: IndustryConfig, range: ReportingRange) {
  const transactions = industry.financeTransactions.filter(t => inRange(t.date, range)).sort((a, b) => b.date.localeCompare(a.date));
  const demands = industry.demandRecords.filter(r => inRange(demandDate(r), range));
  const sum = (type: 'income' | 'expense') => transactions.filter(t => t.type === type).reduce((n, t) => n + t.amount, 0);
  const revenue = sum('income'), expense = sum('expense'), profit = revenue - expense;
  const closed = demands.filter(r => r.status === 'closed').length;
  const qualified = demands.filter(r => ['quoted', 'pending', 'closed'].includes(r.status)).length;
  const group = (type: 'income' | 'expense') => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === type).forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return [...map].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };
  const channels = new Map<string, number>();
  demands.forEach(r => channels.set(r.sourceChannel || 'Direct', (channels.get(r.sourceChannel || 'Direct') ?? 0) + 1));
  const buckets = new Map<string, { label: string; revenue: number; expense: number; profit: number; hasRecords: boolean }>();
  const monthly = range.valid && (Date.parse(range.to) - Date.parse(range.from)) / DAY > 62;
  // These are recorded ledger totals: a date with no rows has zero recorded activity.
  // Entirely empty periods still return no chart data.
  if (transactions.length && range.valid) {
    const cursor = new Date(`${monthly ? `${range.from.slice(0, 7)}-01` : range.from}T00:00:00Z`);
    const end = Date.parse(`${range.to}T00:00:00Z`);
    while (cursor.getTime() <= end) {
      const label = cursor.toISOString().slice(0, monthly ? 7 : 10);
      buckets.set(label, { label, revenue: 0, expense: 0, profit: 0, hasRecords: false });
      if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  transactions.forEach(t => {
    const key = monthly ? t.date.slice(0, 7) : t.date;
    const point = buckets.get(key) ?? { label: key, revenue: 0, expense: 0, profit: 0, hasRecords: false };
    if (t.type === 'income') point.revenue += t.amount; else point.expense += t.amount;
    point.profit = point.revenue - point.expense; point.hasRecords = true; buckets.set(key, point);
  });
  return {
    transactions, demands, revenue, expense, profit, margin: percentage(profit, revenue),
    leads: demands.length, qualified, closed, active: demands.length - closed,
    conversion: percentage(qualified, demands.length), closeRate: percentage(closed, qualified), winRate: percentage(closed, demands.length),
    pipelineValue: demands.filter(r => r.status !== 'closed').reduce((n, r) => n + r.serviceAmount * r.serviceQty, 0),
    incomeCategories: group('income'), expenseCategories: group('expense'),
    channels: [...channels].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    trend: [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label)),
    salesTarget: Math.round(industry.targets.salesTarget * range.targetMonths),
    expenseBudget: Math.round(industry.targets.expenseBudget * range.targetMonths),
  };
}
