'use client';

import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { useIndustry } from '@/context/industry-context';

export default function DataApprovalsPage() {
  const { currentIndustry } = useIndustry();

  const approvals = [
    { id: 'app-1', file: `${currentIndustry.name} Demand Sheet.xlsx`, submitter: 'Ko Aung (Sales Lead)', date: 'Today, 09:30 AM', status: 'Approved', rows: '45 rows imported' },
    { id: 'app-2', file: `${currentIndustry.name} Expenses June.csv`, submitter: 'Daw Hla Hla (Accountant)', date: 'Yesterday, 04:15 PM', status: 'Approved', rows: '18 transactions' },
    { id: 'app-3', file: 'Daily Operations Handover.xlsx', submitter: 'Shift Supervisor', date: 'Jun 23, 11:00 AM', status: 'Imported', rows: '12 logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Data Submissions & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit history of imported spreadsheet feeds and verification timestamps.
          </p>
        </PageHeadingCopy>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Data Ingestions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">File / Report Name</th>
                <th className="py-2.5 font-semibold">Submitted By</th>
                <th className="py-2.5 font-semibold">Ingestion Scope</th>
                <th className="py-2.5 font-semibold">Timestamp</th>
                <th className="py-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {approvals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {item.file}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    {item.submitter}
                  </td>
                  <td className="py-3 text-slate-500">
                    {item.rows}
                  </td>
                  <td className="py-3 text-slate-500 font-mono text-[11px]">
                    {item.date}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
