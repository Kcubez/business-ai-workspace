'use client';

import { useIndustry } from '@/context/industry-context';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { DEMO_SNAPSHOT_DATE, inRange } from '@/lib/metrics';
import { useState } from 'react';
import { TablePagination } from '@/components/ui/table-pagination';
import { getSectorPageCopy } from '@/lib/sector-page-copy';
import {
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export default function CustomerServicePage() {
  const { currentIndustry, markFollowUpDone } = useIndustry();
  const { range } = useReportingMetrics();
  const asOf = range.valid && range.to < DEMO_SNAPSHOT_DATE ? range.to : DEMO_SNAPSHOT_DATE;
  const customerFollowUps = currentIndustry.customerFollowUps
    .filter(f => inRange(f.dueDate, range))
    .map(f => ({ ...f, dueStatus: f.dueDate < asOf ? 'overdue' : f.dueDate === asOf ? 'due_today' : 'upcoming' }));
  const pageCopy = getSectorPageCopy(currentIndustry.id);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(customerFollowUps.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const paginatedFollowUps = customerFollowUps.slice((validPage - 1) * pageSize, validPage * pageSize);

  const dueToday = customerFollowUps.filter((f) => f.dueStatus === 'due_today');
  const overdue = customerFollowUps.filter((f) => f.dueStatus === 'overdue');
  const upcoming = customerFollowUps.filter((f) => f.dueStatus === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">Care & Follow-ups</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageCopy.customerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pageCopy.customerSubtitle}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {dueToday.length}
          </div>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1">
            Immediate attention required
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {overdue.length}
          </div>
          <p className="text-xs text-rose-500 font-medium mt-1">Missed callback schedule</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming (7 Days)</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {upcoming.length}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Pre-scheduled reminders</p>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Active Follow-up Queue
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Contact schedule across Phone, Telegram, Viber, and Messenger
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">{pageCopy.clientColHeader}</th>
                <th className="py-2.5 font-semibold">{pageCopy.followUpTopicHeader}</th>
                <th className="py-2.5 font-semibold">Channel</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Target Date</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedFollowUps.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-500">No follow-ups due in this period.</td></tr>}
              {paginatedFollowUps.map((item) => {
                const statusClass =
                  item.dueStatus === 'overdue'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : item.dueStatus === 'due_today'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.phone}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.topic}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.notes}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${statusClass}`}>
                        {item.dueStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {item.dueDate}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => markFollowUpDone(item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-[11px] hover:opacity-90 cursor-pointer active:scale-95 transition-transform"
                      >
                        Mark Done
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 10-row Table Pagination */}
        <TablePagination
          currentPage={validPage}
          totalItems={customerFollowUps.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
