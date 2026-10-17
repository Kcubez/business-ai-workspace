'use client';

import React, { createContext, useContext, useState, useLayoutEffect } from 'react';
import { INDUSTRIES, IndustryId, IndustryConfig } from '@/data/industries';
import { serializeDemoState, restoreDemoState } from '@/lib/demo-data-cache';
import { refreshSeedRecords } from '@/lib/demo-data-migration';
import { getEnrichedIndustries, getLegacyEnrichedIndustries } from '@/lib/extended-data-injector';
import { toast } from 'sonner';
import { reportingRange, validDate } from '@/lib/metrics';
import { demoSlugToIndustry } from '@/lib/sector-page-copy';

export type PeriodMode = 'overall' | 'day' | 'month' | 'year' | 'custom';
export type DateRangePreset = 'today' | '7d' | '30d' | 'mtd' | 'last_month' | 'ytd';

interface IndustryContextType {
  currentIndustryId: IndustryId;
  currentIndustry: IndustryConfig;
  setIndustryId: (id: IndustryId) => void;
  allIndustries: IndustryConfig[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  dateRange: DateRangePreset;
  setDateRange: (range: DateRangePreset) => void;
  periodMode: PeriodMode;
  setPeriodMode: (mode: PeriodMode) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonthNum: number;
  setSelectedMonthNum: (month: number) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  customFrom: string;
  setCustomFrom: (date: string) => void;
  customTo: string;
  setCustomTo: (date: string) => void;
  dateRangeMultiplier: number;
  dateRangeLabel: string;
  addDemandRecord: (record: Omit<IndustryConfig['demandRecords'][0], 'id'>) => void;
  updateDemandRecord: (id: string, record: Omit<IndustryConfig['demandRecords'][0], 'id'>) => void;
  deleteDemandRecord: (id: string) => void;
  addFinanceTransaction: (tx: Omit<IndustryConfig['financeTransactions'][0], 'id'>) => void;
  deleteFinanceTransaction: (id: string) => void;
  markFollowUpDone: (id: string) => void;
  resetDemoData: () => void;
  isHydrated: boolean;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export function IndustryProvider({ children }: { children: React.ReactNode }) {
  const [currentIndustryId, setCurrentIndustryId] = useState<IndustryId>('clinic');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('June 2026');
  const [dateRange, setDateRange] = useState<DateRangePreset>('mtd');

  // Exact period controls as business-ai-integration-service
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(6);
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [customFrom, setCustomFrom] = useState<string>('2026-06-01');
  const [customTo, setCustomTo] = useState<string>('2026-06-30');

  const [industryState, setIndustryState] = useState<Record<IndustryId, IndustryConfig>>(() => getEnrichedIndustries());

  const range = reportingRange({ periodMode, selectedYear, selectedMonthNum, selectedDay, customFrom, customTo });
  const periodLabel = range.label;
  // Retained for compatibility: only calendar-prorated targets use this value.
  const effectiveMultiplier = range.targetMonths;

  // Restore the sector before revealing the dashboard; server HTML stays neutral.
  useLayoutEffect(() => {
    const demoMatch = window.location.pathname.match(/^\/demo\/([^/]+)\/?$/);
    const routeIndustry = demoMatch && Object.hasOwn(demoSlugToIndustry, demoMatch[1])
      ? demoSlugToIndustry[demoMatch[1]]
      : undefined;
    if (routeIndustry) setCurrentIndustryId(routeIndustry);

    try {
      if (routeIndustry) localStorage.setItem('mot_selected_industry', routeIndustry);
      const saved = localStorage.getItem('mot_selected_industry') as IndustryId;
      if (!routeIndustry && saved && Object.hasOwn(INDUSTRIES, saved)) {
        setCurrentIndustryId(saved);
      }
      const savedCurrentData = localStorage.getItem('mot_custom_industry_data_v5');
      const savedCustomData = savedCurrentData ?? localStorage.getItem('mot_custom_industry_data_v4');
      if (savedCustomData) {
        try {
          const payload = JSON.parse(savedCustomData);
          // Preserve valid saved records, including intentionally empty arrays.
          // Source-owned configuration always wins over stale cached labels/targets.
          const fresh = getEnrichedIndustries();
          const parsed = restoreDemoState(payload, fresh);
          const previous = savedCurrentData ? null : getLegacyEnrichedIndustries();
          for (const id of Object.keys(fresh) as IndustryId[]) {
            const cached = parsed?.[id];
            if (!cached) continue;
            if (Array.isArray(cached.demandRecords) && cached.demandRecords.every(r =>
              r && typeof r.id === 'string' && typeof r.customerName === 'string' &&
              typeof r.company === 'string' && typeof r.serviceName === 'string' &&
              typeof r.phone === 'string' && typeof r.note === 'string' &&
              typeof r.sourceChannel === 'string' && validDate(r.followUpDate) &&
              Number.isFinite(r.serviceAmount) && r.serviceAmount >= 0 &&
              Number.isFinite(r.serviceQty) && r.serviceQty > 0 &&
              ['new', 'contacted', 'quoted', 'pending', 'closed'].includes(r.status) &&
              (r.createdDate === undefined || validDate(r.createdDate)))) {
              fresh[id].demandRecords = previous ? refreshSeedRecords(fresh[id].demandRecords, previous[id].demandRecords, cached.demandRecords) : cached.demandRecords;
            }
            if (Array.isArray(cached.financeTransactions) && cached.financeTransactions.every(t =>
              t && typeof t.id === 'string' && validDate(t.date) &&
              typeof t.title === 'string' && typeof t.paymentMethod === 'string' && typeof t.reference === 'string' &&
              typeof t.category === 'string' && ['income', 'expense'].includes(t.type) &&
              Number.isFinite(t.amount) && t.amount >= 0)) {
              fresh[id].financeTransactions = previous ? refreshSeedRecords(fresh[id].financeTransactions, previous[id].financeTransactions, cached.financeTransactions) : cached.financeTransactions;
            }
            if (Array.isArray(cached.customerFollowUps) && cached.customerFollowUps.every(f =>
              f && typeof f.id === 'string' && validDate(f.dueDate) &&
              typeof f.name === 'string' && typeof f.phone === 'string' &&
              typeof f.topic === 'string' && typeof f.channel === 'string' && typeof f.notes === 'string')) {
              fresh[id].customerFollowUps = previous ? refreshSeedRecords(fresh[id].customerFollowUps, previous[id].customerFollowUps, cached.customerFollowUps) : cached.customerFollowUps;
            }
          }
          setIndustryState(fresh);
          try {
            localStorage.setItem('mot_custom_industry_data_v5', serializeDemoState(fresh));
            if (!savedCurrentData) localStorage.removeItem('mot_custom_industry_data_v4');
          } catch {
            // Keep the old cache intact if the migrated payload cannot be saved.
          }
        } catch (err) {
          console.error('Failed to load cached custom data', err);
        }
      } else {
        localStorage.removeItem('mot_custom_industry_data');
        localStorage.removeItem('mot_custom_industry_data_v2');
        localStorage.removeItem('mot_custom_industry_data_v3');
        const fresh = getEnrichedIndustries();
        setIndustryState(fresh);
        try {
          localStorage.setItem('mot_custom_industry_data_v5', serializeDemoState(fresh));
        } catch {
          // ignore storage error
        }
      }
    } catch {
      // Storage can be unavailable or full. Keep the in-memory defaults usable.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const saveCustomState = (updated: Record<IndustryId, IndustryConfig>) => {
    setIndustryState(updated);
    try {
      localStorage.setItem('mot_custom_industry_data_v5', serializeDemoState(updated));
    } catch {
      // ignore storage error
    }
  };

  const handleSetIndustry = (id: IndustryId) => {
    if (INDUSTRIES[id]) {
      setCurrentIndustryId(id);
      try {
        localStorage.setItem('mot_selected_industry', id);
      } catch {
        // Keep sector switching usable when browser storage is unavailable.
      }
    }
  };

  // Step 2 Interactive actions:
  const addDemandRecord = (record: Omit<IndustryConfig['demandRecords'][0], 'id'>) => {
    const newId = `rec-${Date.now()}`;
    if (!Number.isFinite(record.serviceAmount) || record.serviceAmount < 0 ||
        !Number.isFinite(record.serviceQty) || record.serviceQty <= 0 ||
        !record.createdDate || !validDate(record.createdDate)) {
      toast.error('Enter a valid record date, amount and quantity.');
      return;
    }
    const newRecord = { ...record, id: newId };
    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        demandRecords: [newRecord, ...industryState[currentIndustryId].demandRecords],

      },
    };
    saveCustomState(updated);
    toast.success('Record added successfully');
  };

  const deleteDemandRecord = (id: string) => {
    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        demandRecords: industryState[currentIndustryId].demandRecords.filter((r) => r.id !== id),

      },
    };
    saveCustomState(updated);
    toast.success('Record removed');
  };

  const updateDemandRecord = (id: string, record: Omit<IndustryConfig['demandRecords'][0], 'id'>) => {
    if (!Number.isFinite(record.serviceAmount) || record.serviceAmount < 0 ||
        !Number.isFinite(record.serviceQty) || record.serviceQty <= 0 ||
        !record.createdDate || !validDate(record.createdDate)) {
      toast.error('Enter a valid record date, amount and quantity.');
      return;
    }

    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        demandRecords: industryState[currentIndustryId].demandRecords.map((existing) =>
          existing.id === id ? { ...record, id } : existing
        ),
      },
    };
    saveCustomState(updated);
    toast.success('Record updated successfully');
  };

  const addFinanceTransaction = (tx: Omit<IndustryConfig['financeTransactions'][0], 'id'>) => {
    const newId = `tx-${Date.now()}`;
    if (!validDate(tx.date) || !Number.isFinite(tx.amount) || tx.amount <= 0) {
      toast.error('Enter a valid transaction date and positive amount.');
      return;
    }
    const newTx = { ...tx, id: newId };
    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        financeTransactions: [newTx, ...industryState[currentIndustryId].financeTransactions],

      },
    };
    saveCustomState(updated);
    toast.success('Transaction posted');
  };

  const deleteFinanceTransaction = (id: string) => {
    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        financeTransactions: industryState[currentIndustryId].financeTransactions.filter((t) => t.id !== id),

      },
    };
    saveCustomState(updated);
    toast.success('Transaction deleted');
  };

  const markFollowUpDone = (id: string) => {
    const updated = {
      ...industryState,
      [currentIndustryId]: {
        ...industryState[currentIndustryId],
        customerFollowUps: industryState[currentIndustryId].customerFollowUps.filter((f) => f.id !== id),
      },
    };
    saveCustomState(updated);
    toast.success('Follow-up marked as completed');
  };

  const resetDemoData = () => {
    const fresh = getEnrichedIndustries();
    setIndustryState(fresh);
    setPeriodMode('month');
    setSelectedYear(2026);
    setSelectedMonthNum(6);
    setSelectedDay(25);
    setCustomFrom('2026-06-01');
    setCustomTo('2026-06-30');
    try {
      localStorage.setItem('mot_custom_industry_data_v5', serializeDemoState(fresh));
    } catch {
      // The in-memory reset still gives the current demo a clean state.
    }
    toast.success('Demo data reset to the default records');
  };

  return (
    <IndustryContext.Provider
      value={{
        currentIndustryId,
        currentIndustry: industryState[currentIndustryId] || INDUSTRIES[currentIndustryId],
        setIndustryId: handleSetIndustry,
        allIndustries: Object.values(industryState),
        selectedMonth,
        setSelectedMonth,
        dateRange,
        setDateRange,
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
        dateRangeMultiplier: effectiveMultiplier,
        dateRangeLabel: periodLabel,
        addDemandRecord,
        updateDemandRecord,
        deleteDemandRecord,
        addFinanceTransaction,
        deleteFinanceTransaction,
        markFollowUpDone,
        resetDemoData,
        isHydrated,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const context = useContext(IndustryContext);
  if (!context) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
}
