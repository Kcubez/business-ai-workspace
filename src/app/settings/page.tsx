'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { DestructiveConfirmDialog } from '@/components/ui/destructive-confirm-dialog';

export default function SettingsPage() {
  const { currentIndustry, resetDemoData } = useIndustry();
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage mock data environment and active industry parameters.
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Data Engine Status
        </h3>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
          <div className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">
            Frontend Mock JSON Mode (Zero External Database)
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            Running purely in-browser with fast static JSON state. No Supabase or Telegram bot webhook required.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Current Workspace: <span className="text-sky-600">{currentIndustry.name}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Category Sector: {currentIndustry.badge}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Demo Data</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Restore every industry&apos;s default demo records. This clears leads, transactions, and completed follow-ups saved in this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsResetOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {isResetOpen && (
        <DestructiveConfirmDialog
          title="Reset demo data?"
          description="All locally saved leads, financial transactions, and follow-up changes will be replaced with the default demo records. Your active industry stays selected."
          notice="This only affects this browser"
          confirmLabel="Reset Demo Data"
          confirmationText="RESET"
          confirmationLabel="Type RESET to restore the default demo records"
          onCancel={() => setIsResetOpen(false)}
          onConfirm={() => {
            resetDemoData();
            setIsResetOpen(false);
          }}
        />
      )}
    </div>
  );
}
