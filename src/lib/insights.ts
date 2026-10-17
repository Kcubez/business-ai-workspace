import type { IndustryConfig } from '@/data/industries';
import { calculateMetrics, inRange, type ReportingRange } from './metrics';

export type Insight = {
  id: string;
  severity: 'urgent' | 'warning';
  title: string;
  description: string;
  recordIds: string[];
  actionText: string;
  actionLink: string;
};

// Follow-ups store current outstanding work, not historical completion events.
export function followUpsForPeriod(industry: IndustryConfig, range: ReportingRange) {
  return industry.customerFollowUps.filter(f => inRange(f.dueDate, range)).map(f => ({
    ...f,
    dueStatus: f.dueDate < range.to ? 'overdue' : 'due_today',
  }));
}

export function calculateInsights(industry: IndustryConfig, range: ReportingRange): Insight[] {
  if (!range.valid) return [];
  const metrics = calculateMetrics(industry, range);
  const insights: Insight[] = [];
  const overdue = followUpsForPeriod(industry, range).filter(f => f.dueStatus === 'overdue');
  const money = (amount: number) => `${amount.toLocaleString('en-US')} MMK`;
  if (overdue.length) insights.push({
    id: 'overdue-follow-ups', severity: 'warning',
    title: `${overdue.length} overdue follow-up${overdue.length === 1 ? '' : 's'}`,
    description: `Currently outstanding follow-ups due in ${range.label}, before ${range.to}. This uses current completion state, not historical status.`,
    recordIds: overdue.map(f => f.id), actionText: 'Review overdue follow-ups',
    actionLink: '/customer-service?filter=overdue#follow-up-records',
  });
  if (metrics.expense > metrics.expenseBudget && metrics.expenseBudget > 0) insights.push({
    id: 'expenses-above-budget', severity: 'urgent', title: 'Expenses exceed the period budget',
    description: `${money(metrics.expense)} spent against ${money(metrics.expenseBudget)} budget: ${money(metrics.expense - metrics.expenseBudget)} over. Budget is calendar-prorated for ${range.label}.`,
    recordIds: metrics.transactions.filter(t => t.type === 'expense').map(t => t.id),
    actionText: 'Review expenses', actionLink: '/finance?filter=expense#transaction-records',
  });
  if (metrics.salesTarget > 0 && metrics.revenue < metrics.salesTarget) insights.push({
    id: 'income-below-target', severity: 'warning', title: 'Recorded income is below the period target',
    description: `${money(metrics.revenue)} recorded against ${money(metrics.salesTarget)} target: ${money(metrics.salesTarget - metrics.revenue)} remaining. Target is calendar-prorated for ${range.label}; this is not a forecast.`,
    recordIds: metrics.transactions.filter(t => t.type === 'income').map(t => t.id),
    actionText: 'Review income', actionLink: '/finance?filter=income#transaction-records',
  });
  return insights;
}
