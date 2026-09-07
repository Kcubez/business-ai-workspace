'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useIndustry, PeriodMode } from '@/context/industry-context';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { reportingRange } from '@/lib/metrics';

export function DateFilterBar({ className = '' }: { className?: string }) {
  const {
    periodMode,
    setPeriodMode,
    selectedYear,
    setSelectedYear,
    selectedMonthNum,
    setSelectedMonthNum,
    selectedDay,
    setSelectedDay,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    dateRangeLabel,
  } = useIndustry();

  const [isOpen, setIsOpen] = useState(false);
  const range = reportingRange({ periodMode, selectedYear, selectedMonthNum, selectedDay, customFrom, customTo });
  const containerRef = useRef<HTMLDivElement>(null);

  const years = [2024, 2025, 2026];
  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  const modes: { key: PeriodMode; label: string }[] = [
    { key: 'month', label: 'Monthly' },
    { key: 'day', label: 'Daily' },
    { key: 'year', label: 'Yearly' },
    { key: 'overall', label: 'Overall' },
    { key: 'custom', label: 'Custom' },
  ];

  // Auto-clamp month if user is on 2026 and month > September (9)
  useEffect(() => {
    if (selectedYear === 2026 && selectedMonthNum > 9) {
      setSelectedMonthNum(9);
    }
  }, [selectedYear, selectedMonthNum, setSelectedMonthNum]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDisplayLabel = () => {
    if (periodMode === 'month') {
      const m = months.find((item) => item.num === selectedMonthNum);
      return `${m?.name || 'June'} ${selectedYear}`;
    }
    if (periodMode === 'day') {
      return `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    }
    if (periodMode === 'year') {
      return `Year ${selectedYear}`;
    }
    if (periodMode === 'overall') {
      return 'All Time';
    }
    if (periodMode === 'custom') {
      return `${customFrom} → ${customTo}`;
    }
    return dateRangeLabel;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Top Trigger Button matching the top header UI in screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
        aria-label="Filter Reporting Period"
      >
        <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-none">{getDisplayLabel()}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover combining all functionalities */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Reporting Period
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
              {periodMode}
            </span>
          </div>

          {/* Period Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-2">
            {modes.slice(0, 3).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setPeriodMode(m.key)}
                className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  periodMode === m.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-3">
            {modes.slice(3).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setPeriodMode(m.key)}
                className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  periodMode === m.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Dynamic mode controls */}
          <div className="pt-0.5">
            {/* MONTHLY MODE */}
            {periodMode === 'month' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Year:</span>
                  <div className="flex gap-1">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setSelectedYear(y)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          selectedYear === y
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {months.map((m) => {
                    const isFutureMonth = selectedYear === 2026 && m.num > 9;
                    return (
                      <button
                        key={m.num}
                        type="button"
                        disabled={isFutureMonth}
                        onClick={() => {
                          if (isFutureMonth) return;
                          setSelectedMonthNum(m.num);
                          setIsOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all ${
                          isFutureMonth
                            ? 'opacity-35 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400'
                            : selectedMonthNum === m.num
                            ? 'bg-sky-500 text-white font-bold shadow-xs cursor-pointer'
                            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer'
                        }`}
                      >
                        <span>{m.name.slice(0, 3)}</span>
                        {selectedMonthNum === m.num && !isFutureMonth && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAILY MODE */}
            {periodMode === 'day' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Select Specific Date (2024 – Sep 7, 2026)
                </label>
                <input
                  type="date"
                  min="2024-01-01"
                  max="2026-09-07"
                  value={`${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-${String(
                    selectedDay
                  ).padStart(2, '0')}`}
                  onChange={(e) => {
                    const d = new Date(`${e.target.value}T00:00:00`);
                    if (!Number.isNaN(d.getTime())) {
                      setSelectedYear(d.getFullYear());
                      setSelectedMonthNum(d.getMonth() + 1);
                      setSelectedDay(d.getDate());
                    }
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-2 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors cursor-pointer"
                >
                  Apply Date
                </button>
              </div>
            )}

            {/* YEARLY MODE */}
            {periodMode === 'year' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Select Fiscal Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setSelectedYear(y);
                        setIsOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedYear === y
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {y === 2026 ? '2026 (YTD)' : y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OVERALL LIFETIME MODE */}
            {periodMode === 'overall' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Overall Activity (2024 – Sep 7, 2026)
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Includes recorded demo rows from 2024 through September 7, 2026. Dates without records remain empty.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {/* CUSTOM DATE RANGE MODE */}
            {periodMode === 'custom' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min="2024-01-01"
                    max="2026-09-07"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={customFrom || '2024-01-01'}
                    max="2026-09-07"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={!range.valid}
                  className="w-full py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply Custom Range
                </button>
                {!range.valid && <p role="alert" className="text-xs text-rose-600">Choose valid dates with the end on or after the start.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
