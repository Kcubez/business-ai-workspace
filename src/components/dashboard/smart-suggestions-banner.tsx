'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { Button } from '@/components/ui/button';

export function SmartSuggestionsBanner({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentIndustry } = useIndustry();
  const themeColor = currentIndustry.color;

  const briefs = currentIndustry.aiBriefs || [];
  if (briefs.length === 0) return null;

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
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Suggestions are hidden until you choose to review them ({currentIndustry.name}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 border-t p-4 sm:p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs"
          style={{ borderColor: `${themeColor}55` }}
        >
          {briefs.map((brief, idx) => {
            const isUrgent = brief.severity === 'urgent';
            const isWarning = brief.severity === 'warning';

            const borderColor = isUrgent
              ? 'border-rose-300 dark:border-rose-900/60 border-l-rose-500'
              : isWarning
              ? 'border-amber-300 dark:border-amber-900/60 border-l-amber-500'
              : 'border-slate-200 dark:border-slate-800';

            const badgeBg = isUrgent
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : isWarning
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300';

            const Icon = isUrgent ? AlertTriangle : isWarning ? AlertCircle : Lightbulb;

            return (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 border ${borderColor} border-l-4 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all`}
                style={!isUrgent && !isWarning ? { borderLeftColor: themeColor, borderColor: `${themeColor}55` } : undefined}
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
                        {brief.severity}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                    {brief.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {brief.description}
                  </p>
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
