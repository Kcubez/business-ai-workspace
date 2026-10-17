'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, ArrowRight, CheckCircle2, CircleHelp } from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { useInsights } from '@/lib/use-insights';
import { Button } from '@/components/ui/button';

export function SmartSuggestionsBanner({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentIndustry } = useIndustry();
  const themeColor = currentIndustry.color;

  const { insights: briefs, range } = useInsights();
  const metrics = useReportingMetrics();
  const money = (value: number) => `${value.toLocaleString('en-US')} MMK`;
  const categories = [
    { id: 'overdue-follow-ups', label: 'Follow-ups', value: `${briefs.find(b => b.id === 'overdue-follow-ups')?.recordIds.length ?? 0}`, unit: 'overdue', title: 'No overdue follow-ups in this period', description: `Currently outstanding records due before ${range.to}. Completion history is not available.`, actionText: 'View follow-ups', actionLink: '/customer-service#follow-up-records', hasData: currentIndustry.customerFollowUps.some(f => f.dueDate >= range.from && f.dueDate <= range.to), configured: true },
    { id: 'expenses-above-budget', label: 'Expense control', value: money(metrics.expense), unit: 'recorded expenses', title: 'Expenses are within the period budget', description: `${money(metrics.expenseBudget)} calendar-prorated budget for this period.`, actionText: 'View expenses', actionLink: '/finance?filter=expense#transaction-records', hasData: metrics.transactions.some(t => t.type === 'expense'), configured: metrics.expenseBudget > 0 },
    { id: 'income-below-target', label: 'Income target', value: money(metrics.revenue), unit: 'recorded income', title: 'Period income target reached', description: `${money(metrics.salesTarget)} calendar-prorated target for this period.`, actionText: 'View income', actionLink: '/finance?filter=income#transaction-records', hasData: metrics.transactions.some(t => t.type === 'income'), configured: metrics.salesTarget > 0 },
  ];

  return (
    <section
      className={`overflow-hidden rounded-2xl border-2 shadow-xs transition-all ${className}`}
      style={{
        borderColor: `${themeColor}55`,
        backgroundColor: `${themeColor}0A`,
      }}
    >
      {/* Header bar with collapsible toggle */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Smart Suggestions
              </h2>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
              >
                {briefs.length} to review
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rule-based suggestions · {currentIndustry.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            aria-expanded={isOpen}
            aria-controls="smart-suggestion-cards"
            onClick={() => setIsOpen((prev) => !prev)}
            className="h-8 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs cursor-pointer"
          >
            {isOpen ? 'Hide suggestions' : 'View suggestions'}
            {isOpen ? (
              <ChevronUp className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Suggestions Cards */}
      {isOpen && (
        <div
          id="smart-suggestion-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 border-t p-4 sm:p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs"
          style={{ borderColor: `${themeColor}55` }}
        >
          {categories.map((category) => {
            const finding = briefs.find(b => b.id === category.id);
            const neutral = !range.valid || (!finding && (!category.hasData || !category.configured));
            const brief = finding ?? {
              ...category,
              severity: neutral ? 'neutral' : 'good',
              title: !range.valid ? 'Choose a valid reporting period' : !category.configured ? 'No target configured' : !category.hasData ? 'No records in this period' : category.title,
              recordIds: [],
            };
            const isUrgent = brief.severity === 'urgent';
            const isWarning = brief.severity === 'warning';

            const borderColor = isUrgent
              ? 'border-rose-300 dark:border-rose-900/60 border-l-rose-500'
              : isWarning
              ? 'border-amber-300 dark:border-amber-900/60 border-l-amber-500'
              : neutral ? 'border-slate-200 dark:border-slate-800' : 'border-emerald-200 dark:border-emerald-900/60 border-l-emerald-500';

            const badgeBg = isUrgent
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : isWarning
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              : neutral ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';

            const Icon = isUrgent ? AlertTriangle : isWarning ? AlertCircle : neutral ? CircleHelp : CheckCircle2;

            return (
              <div
                key={brief.id}
                className={`bg-white dark:bg-slate-900 border ${borderColor} border-l-4 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all`}

              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isUrgent
                            ? 'text-rose-600 dark:text-rose-400'
                            : isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : ''
                        }`}
                        style={!isUrgent && !isWarning ? { color: themeColor } : undefined}
                      />
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeBg}`}>
                        {isUrgent ? 'Over budget' : isWarning ? 'Needs attention' : neutral ? 'Not assessed' : 'On track'}
                      </span>
                    </div>
                  </div>

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{category.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{range.valid ? category.value : '—'}</p>
                  <p className="mb-4 mt-1 text-xs text-slate-500">{category.unit}</p>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                    {brief.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {!range.valid ? 'Select a reporting period to assess this area.' : brief.description}
                  </p>
                  <details className="mt-3 text-[10px] text-slate-500"><summary className="cursor-pointer font-medium">How this is measured</summary><p className="mt-2 break-words">Evidence: {brief.recordIds.length ? `${brief.recordIds.length} records · ${brief.recordIds.slice(0, 3).join(", ")}${brief.recordIds.length > 3 ? " …" : ""}` : "No alert triggered by this rule"}</p></details>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={brief.actionLink}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      isUrgent
                        ? 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
                        : isWarning
                        ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                        : ''
                    }`}
                    style={!isUrgent && !isWarning ? { color: themeColor } : undefined}
                  >
                    <span>{brief.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
