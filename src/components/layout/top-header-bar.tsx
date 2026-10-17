'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { DateFilterBar } from '@/components/dashboard/date-filter-bar';

import { useInsights } from '@/lib/use-insights';

export function TopHeaderBar() {
  const { currentIndustry } = useIndustry();

  const { insights: aiBriefs } = useInsights();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [readBriefs, setReadBriefs] = useState<string[]>([]);

  const unreadCount = (aiBriefs || []).filter((b) => !readBriefs.includes(b.title)).length;

  const handleMarkAllRead = () => {
    setReadBriefs((aiBriefs || []).map((b) => b.title));
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Quick Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={`Search ${currentIndustry.name} records, BOQ, invoices...`}
            className="w-full pl-8 pr-12 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-500 transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            <span>⌘</span>
            <span>K</span>
          </div>

          {/* Quick Search Dropdown Preview */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 text-xs max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Matching Operations Data</span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Matching Demand records */}
              {currentIndustry.demandRecords
                .filter(
                  (r) =>
                    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.company.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 4)
                .map((r) => (
                  <Link
                    key={r.id}
                    href="/sales-marketing"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors block"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{r.customerName}</p>
                      <p className="text-[10px] text-slate-400">{r.serviceName} • {r.company}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                      {r.serviceAmount.toLocaleString()} MMK
                    </span>
                  </Link>
                ))}

              {/* Matching Projects */}
              {currentIndustry.projectItems
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.id}
                    href="/projects-infra"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors block"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.category} • {p.owner}</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Month Selector, Notification Bell, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Unified Period Filter Bar */}
        <DateFilterBar />

        {/* Notification Center */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
                aria-label="Notifications"
              />
            }
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-0">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Operational Alerts & Briefs
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {aiBriefs.length === 0 && <p className="p-4 text-xs text-slate-500">No suggestions triggered for this period.</p>}
              {(aiBriefs || []).map((brief, idx) => {
                const isRead = readBriefs.includes(brief.title);
                return (
                  <div
                    key={idx}
                    className={`p-3 text-xs transition-colors ${
                      isRead
                        ? 'opacity-60 bg-transparent'
                        : 'bg-sky-50/40 dark:bg-sky-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {brief.title}
                      </p>
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          brief.severity === 'urgent'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : brief.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        }`}
                      >
                        {brief.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {brief.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        href={brief.actionLink}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>{brief.actionText}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                      {!isRead && (
                        <button
                          onClick={() => setReadBriefs((prev) => [...prev, brief.title])}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-center">
              <Link
                href="/planning"
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
              >
                View Full 90-Day AI Roadmap →
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
