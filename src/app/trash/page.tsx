'use client';

import { Trash2 } from 'lucide-react';

export default function TrashPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trash & Archival</h1>
        <p className="text-xs text-slate-500 mt-0.5">Archived records and deleted items.</p>
      </div>

      <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Trash2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Trash is currently empty</p>
      </div>
    </div>
  );
}
