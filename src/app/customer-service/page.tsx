'use client';

import { AttentionPanel, ClearAttention, RecordFilters, RecordSelect } from '@/components/ui/record-filters';
import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { MetricIcon } from '@/components/ui/metric-icon';
import { useIndustry } from '@/context/industry-context';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { followUpsForPeriod } from '@/lib/insights';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { TablePagination } from '@/components/ui/table-pagination';
import { getSectorPageCopy } from '@/lib/sector-page-copy';
import {
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export default function CustomerServicePage() {
  return <Suspense fallback={<p>Loading follow-ups…</p>}><CustomerServiceContent /></Suspense>;
}

function CustomerServiceContent() {
  const { currentIndustry, markFollowUpDone } = useIndustry();
  const { range } = useReportingMetrics();
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get('filter') || 'all';
  const allFollowUps = followUpsForPeriod(currentIndustry, range);
  const [search, setSearch] = useState('');
  const [aging, setAging] = useState('all');
  const [sort, setSort] = useState('oldest');
  const age = (date: string) => Math.max(0, Math.round((Date.parse(range.to) - Date.parse(date)) / 86400000));
  const customerFollowUps = allFollowUps.filter(item =>
    (status === 'all' || (status === 'overdue' ? item.dueStatus === 'overdue' : status === 'due_today' ? item.dueStatus === 'due_today' : true)) &&
    (aging === 'all' || (item.dueStatus === 'overdue' && (aging === '1-7' ? age(item.dueDate) <= 7 : aging === '8-14' ? age(item.dueDate) >= 8 && age(item.dueDate) <= 14 : age(item.dueDate) >= 15))) &&
    `${item.name} ${item.phone} ${item.topic} ${item.channel}`.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => sort === 'oldest' ? a.dueDate.localeCompare(b.dueDate) : b.dueDate.localeCompare(a.dueDate));
  const pageCopy = getSectorPageCopy(currentIndustry.id);

  const [currentPage, setCurrentPage] = useState(1);
  const selectStatus = (value: string) => {
    const query = new URLSearchParams(params.toString());
    if (value === 'all') query.delete('filter'); else query.set('filter', value);
    router.replace(`/customer-service${query.size ? `?${query}` : ''}#follow-up-records`, { scroll: false });
    setCurrentPage(1); setAging('all'); setSearch('');
  };
  const pageSize = 10;
  const totalPages = Math.ceil(customerFollowUps.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const paginatedFollowUps = customerFollowUps.slice((validPage - 1) * pageSize, validPage * pageSize);

  const dueToday = allFollowUps.filter((f) => f.dueStatus === 'due_today');
  const overdue = allFollowUps.filter((f) => f.dueStatus === 'overdue');


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {pageCopy.customerSubtitle}
          </p>
        </PageHeadingCopy>
      </div>

      <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">Assessed as of {range.valid ? range.to : '—'}<button type="button" aria-label="About follow-up counts" title={`Includes currently outstanding follow-ups with due dates in ${range.label}. Assessed against the period end, not historical completion status.`} className="flex size-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-semibold dark:border-slate-700">i</button></p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button type="button" onClick={() => selectStatus('due_today')} aria-pressed={status === 'due_today'} className="text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-l-4 border-slate-200 dark:border-slate-800 shadow-xs" style={{ borderLeftColor: '#0ea5e9', boxShadow: status === 'due_today' ? '0 0 0 1px #0ea5e9' : undefined }}>
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold ">Due at period end</span>
            <MetricIcon icon={Clock} color="#0ea5e9" />
          </div>
          <div className="self-center text-2xl leading-tight tabular-nums tracking-tight font-bold text-slate-900 dark:text-white">
            {dueToday.length}
          </div>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-medium leading-relaxed">
            Due on the reporting end date
          </p>
        </button>

        <button type="button" onClick={() => selectStatus('overdue')} aria-pressed={status === 'overdue'} className="text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-l-4 border-slate-200 dark:border-slate-800 shadow-xs" style={{ borderLeftColor: '#f43f5e', boxShadow: status === 'overdue' ? '0 0 0 1px #f43f5e' : undefined }}>
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold ">Overdue</span>
            <MetricIcon icon={AlertTriangle} color="#f43f5e" />
          </div>
          <div className="self-center text-2xl leading-tight tabular-nums tracking-tight font-bold text-rose-600 dark:text-rose-400">
            {overdue.length}
          </div>
          <p className="text-xs text-rose-500 font-medium leading-relaxed">Missed callback schedule</p>
        </button>

        <button type="button" onClick={() => selectStatus('all')} aria-pressed={status === 'all'} className="text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-l-4 border-slate-200 dark:border-slate-800 shadow-xs" style={{ borderLeftColor: '#64748b', boxShadow: status === 'all' ? '0 0 0 1px #64748b' : undefined }}>
          <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
            <span className="text-sm font-semibold ">Outstanding in period</span>
            <MetricIcon icon={Calendar} color="#64748b" />
          </div>
          <div className="self-center text-2xl leading-tight tabular-nums tracking-tight font-bold text-slate-900 dark:text-white">
            {allFollowUps.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Current outstanding records</p>
        </button>
      </div>

      <AttentionPanel title="Follow-up insights" chartTitle="Overdue aging" reviewTitle="Oldest outstanding follow-ups" subtitle="Outstanding records due within the selected period, assessed at its end." data={[
        { id: '1-7', label: '1–7 days overdue', min: 1, max: 7, color: '#f59e0b' },
        { id: '8-14', label: '8–14 days overdue', min: 8, max: 14, color: '#f97316' },
        { id: '15+', label: '15+ days overdue', min: 15, max: Infinity, color: '#f43f5e' },
      ].map(bucket => ({ label: bucket.label, value: overdue.filter(item => age(item.dueDate) >= bucket.min && age(item.dueDate) <= bucket.max).length, color: bucket.color, selected: aging === bucket.id, onSelect: () => { selectStatus('overdue'); setAging(bucket.id); } }))}>
        {overdue.length ? <ul className="space-y-3">{[...overdue].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3).map(item => <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-xs font-semibold text-slate-900 dark:text-white">{item.name}</p><span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{age(item.dueDate)} days overdue</span></div><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.topic}</p><p className="mt-2 text-[11px] text-slate-400">{item.dueDate} · {item.channel}</p></li>)}</ul> : <ClearAttention>No overdue follow-ups in this period.</ClearAttention>}
      </AttentionPanel>

      {/* Task Queue Table */}
      <div id="follow-up-records" className="scroll-mt-20 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Active Follow-up Queue
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Contact schedule across Phone, Telegram, Viber, and Messenger
        </p>

        <RecordFilters search={search} onSearch={value => { setSearch(value); setCurrentPage(1); }} placeholder="Search contacts, topics or channels…" count={customerFollowUps.length} onReset={() => { selectStatus('all'); setSort('oldest'); }}>
          <RecordSelect aria-label="Filter follow-up status" value={status} onValueChange={selectStatus}><option value="all">All outstanding</option><option value="overdue">Overdue</option><option value="due_today">Due at period end</option></RecordSelect>
          <RecordSelect aria-label="Filter overdue age" value={aging} onValueChange={value => { setAging(value); setCurrentPage(1); }}><option value="all">All ages</option><option value="1-7">1–7 days overdue</option><option value="8-14">8–14 days overdue</option><option value="15+">15+ days overdue</option></RecordSelect>
          <RecordSelect aria-label="Sort follow-up dates" value={sort} onValueChange={value => { setSort(value); setCurrentPage(1); }}><option value="oldest">Oldest first</option><option value="newest">Newest first</option></RecordSelect>
        </RecordFilters>
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
              {paginatedFollowUps.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-500">No follow-ups match this period and these filters.</td></tr>}
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
                      <div className="text-[10px] text-slate-400">{item.phone} · {item.id}</div>
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
                        style={{ backgroundColor: currentIndustry.color }}
                        className="px-3 py-1 rounded-lg text-white font-semibold text-[11px] hover:opacity-90 cursor-pointer active:scale-95 transition-transform"
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
