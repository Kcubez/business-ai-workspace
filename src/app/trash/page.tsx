'use client';

import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { Trash2 } from 'lucide-react';

export default function TrashPage() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Trash & Archival</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Archived records and deleted items.</p>
        </PageHeadingCopy>
      </div>

      <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Trash2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Trash is currently empty</p>
      </div>
    </div>
  );
}
