'use client';

import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { formatPercent, demandDate } from '@/lib/metrics';
import { useState } from 'react';
import { useIndustry } from '@/context/industry-context';
import type { IndustryConfig } from '@/data/industries';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  X,
  PieChart,
} from 'lucide-react';
import { DonutPieChart, PieSlice } from '@/components/charts/premium-charts';
import { TablePagination } from '@/components/ui/table-pagination';
import { getSectorPageCopy } from '@/lib/sector-page-copy';
import { SmartSuggestionsBanner } from '@/components/dashboard/smart-suggestions-banner';

export default function SalesMarketingPage() {
  const {
    currentIndustry,
    addDemandRecord,
    updateDemandRecord,
    deleteDemandRecord,
  } = useIndustry();
  const metrics = useReportingMetrics();
  const demandRecords = metrics.demands;
  const pageCopy = getSectorPageCopy(currentIndustry.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const scaledLeads = metrics.leads;
  const scaledAppointments = metrics.qualified;
  const scaledClosed = metrics.closed;
  const [createdDate, setCreatedDate] = useState('');
  const recordDate = createdDate || (metrics.range.valid ? metrics.range.to : '');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');
  const [sourceChannel, setSourceChannel] = useState('Facebook Ads');
  const [status, setStatus] = useState<'new' | 'contacted' | 'quoted' | 'pending' | 'closed'>('new');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [followUpDate, setFollowUpDate] = useState('2026-06-30');
  const [note, setNote] = useState('');

  const resetForm = () => {
    setCreatedDate('');
    setCustomerName('');
    setPhone('');
    setCompany('');
    setServiceName('');
    setServiceAmount('');
    setSourceChannel('Facebook Ads');
    setStatus('new');
    setPriority('high');
    setFollowUpDate('2026-06-30');
    setNote('');
  };

  const closeRecordModal = () => {
    setIsAddOpen(false);
    setEditingRecordId(null);
    resetForm();
  };

  const openNewRecord = () => {
    resetForm();
    setEditingRecordId(null);
    setIsAddOpen(true);
  };

  const openEditRecord = (record: IndustryConfig['demandRecords'][number]) => {
    setEditingRecordId(record.id);
    setCreatedDate(demandDate(record));
    setCustomerName(record.customerName);
    setPhone(record.phone);
    setCompany(record.company);
    setServiceName(record.serviceName);
    setServiceAmount(String(record.serviceAmount));
    setSourceChannel(record.sourceChannel);
    setStatus(record.status);
    setPriority(record.priority);
    setFollowUpDate(record.followUpDate);
    setNote(record.note);
    setIsAddOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !serviceName || !recordDate || !Number.isFinite(Number(serviceAmount)) || Number(serviceAmount) < 0) return;

    const currentRecord = editingRecordId
      ? demandRecords.find((record) => record.id === editingRecordId)
      : undefined;
    const recordData = {
      createdDate: recordDate,
      customerName,
      phone: phone || '09xxxxxxxx',
      company: company || 'Individual',
      serviceName,
      serviceAmount: Number(serviceAmount),
      serviceQty: currentRecord?.serviceQty ?? 1,
      sourceChannel,
      status,
      priority,
      followUpDate,
      note: note || 'New inquiry logged via quick action.',
    };

    if (editingRecordId) {
      updateDemandRecord(editingRecordId, recordData);
    } else {
      addDemandRecord(recordData);
    }
    closeRecordModal();
  };

  const sourceChannelOptions = Array.from(new Set([
    ...demandRecords.map((record) => record.sourceChannel),
    'Direct Contract', 'Facebook Ads', 'Telegram Inquiry', 'Viber VIP', 'Walk-in', 'Referral', 'Tender Submission',
  ])).sort();

  const filteredRecords = demandRecords.filter((record) => {
    const matchesSearch =
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || record.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const paginatedRecords = filteredRecords.slice((validPage - 1) * pageSize, validPage * pageSize);

  const channelColors: Record<string, string> = {
    'Facebook Ads': '#0ea5e9',
    'Facebook Page': '#38bdf8',
    'Telegram Bot': '#22c55e',
    'Telegram': '#10b981',
    'Google Search': '#f59e0b',
    'Google Ads': '#d97706',
    'Referral / Partner': '#8b5cf6',
    'Referral': '#a855f7',
    'TikTok Ads': '#ec4899',
    'TikTok': '#f43f5e',
    'Walk-in / Direct': '#64748b',
    'Direct': '#94a3b8',
  };

  const defaultColors = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

  const channelPieData: PieSlice[] = metrics.channels.map(({ name, value }, index) => ({
    name,
    value,
    color: channelColors[name] || defaultColors[index % defaultColors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageCopy.salesTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Full conversion funnel tracking from leads to closed contracts for {currentIndustry.name}.
          </p>
        </PageHeadingCopy>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openNewRecord}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: currentIndustry.color }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead / Demand</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Visual Conversion Funnel & Channel Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Conversion Funnel */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Conversion Funnel
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {formatPercent(metrics.winRate)} Overall Win Rate
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Current stage of records created in the selected period; quoted, pending and closed records count as qualified.
            </p>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:grid-rows-[1fr_auto_1fr]">
              <div
                className="grid min-h-44 grid-rows-[1fr_auto_1fr] gap-y-3 p-5 sm:row-span-3 sm:grid-rows-subgrid rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center border-l-4 shadow-2xs"
                style={{ borderLeftColor: currentIndustry.color }}
              >
                <span className="self-end text-sm leading-5 font-semibold " style={{ color: currentIndustry.color }}>
                  1. Inbound Leads
                </span>
                <div className="text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {scaledLeads}
                </div>
                <p className="self-start text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  Records created in period
                </p>
              </div>

              <div className="grid min-h-44 grid-rows-[1fr_auto_1fr] gap-y-3 p-5 sm:row-span-3 sm:grid-rows-subgrid rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center relative border-l-4 border-l-amber-500 shadow-2xs">
                <span className="self-end text-sm leading-5 font-semibold text-amber-600 dark:text-amber-400 ">
                  2. Quoted or Beyond
                </span>
                <div className="text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {scaledAppointments}
                </div>
                <p className="self-start text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                  {formatPercent(metrics.conversion)} Qualified
                </p>
              </div>

              <div className="grid min-h-44 grid-rows-[1fr_auto_1fr] gap-y-3 p-5 sm:row-span-3 sm:grid-rows-subgrid rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center border-l-4 border-l-emerald-500 shadow-2xs">
                <span className="self-end text-sm leading-5 font-semibold text-emerald-600 dark:text-emerald-400 ">
                  3. Closed Deals
                </span>
                <div className="text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {scaledClosed}
                </div>
                <p className="self-start text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                  {formatPercent(metrics.closeRate)} Close Rate
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Open Pipeline Value: <strong className="text-slate-800 dark:text-slate-200">{metrics.pipelineValue.toLocaleString()} MMK</strong></span>
            <span>Active Pipeline: <strong className="text-slate-800 dark:text-slate-200">{demandRecords.filter(r => r.status !== 'closed').length} active deals</strong></span>
          </div>
        </div>

        {/* Lead Source Channel Breakdown Pie Chart */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lead Source Channels
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {demandRecords.length} records
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of incoming leads by marketing channel
            </p>

            {channelPieData.length > 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <DonutPieChart data={channelPieData} size={150} innerRadiusRatio={0.62} />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No channel data available
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Primary: <strong className="text-slate-800 dark:text-slate-200">{channelPieData[0]?.name || '—'}</strong></span>
            <span>Channel Diversity: <strong className="text-slate-800 dark:text-slate-200">{channelPieData.length} Sources</strong></span>
          </div>
        </div>
      </div>

      {/* AI Smart Suggestions (Placed below Conversion Funnel & Channels) */}
      <SmartSuggestionsBanner />

      {/* Filter & Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Demand & Client Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered records ({filteredRecords.length} items) · Value = unit amount × quantity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients, services..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <colgroup>
              <col className="w-36" />
              <col />
              <col />
              <col className="w-36" />
              <col className="w-24" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-16" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">{pageCopy.clientColHeader}</th>
                <th className="py-2.5 font-semibold">{pageCopy.companyColHeader}</th>
                <th className="py-2.5 font-semibold">{pageCopy.serviceColHeader}</th>
                <th className="py-2.5 font-semibold">Channel</th>
                <th className="py-2.5 font-semibold">Stage</th>
                <th className="py-2.5 font-semibold whitespace-nowrap">Follow-Up</th>
                <th className="py-2.5 pl-3 font-semibold text-left whitespace-nowrap">{pageCopy.valueColHeader}</th>
                <th className="py-2.5 pl-2 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-slate-500">No records match this period and filters.</td></tr>}
              {paginatedRecords.map((item) => {
                const stageColor =
                  item.status === 'closed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : item.status === 'quoted' || item.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.phone}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">Created: {demandDate(item)}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {item.company}
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200">
                      <div className="font-medium">{item.serviceName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.note}</div>
                    </td>
                    <td className="py-3 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                        {item.sourceChannel}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${stageColor}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.followUpDate}
                    </td>
                    <td className="py-3 pl-3 font-bold font-mono text-left text-slate-900 dark:text-white whitespace-nowrap">
                      {(item.serviceAmount * item.serviceQty).toLocaleString()}
                    </td>
                    <td className="py-3 pl-2 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditRecord(item)}
                          className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer"
                          title="Edit Record"
                          aria-label={`Edit ${item.customerName}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      <button
                        onClick={() => deleteDemandRecord(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
          totalItems={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingRecordId ? 'Edit Demand / Client Record' : pageCopy.addModalTitle}
              </h3>
              <button
                onClick={closeRecordModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
              <label className="block text-slate-500">Record date<input aria-label="Record date" type="date" required value={recordDate} onChange={e => setCreatedDate(e.target.value)} min="2024-01-01" max="2026-09-07" className="mt-1 block w-full rounded-xl border p-2" /></label>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">{pageCopy.addClientLabel}</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={pageCopy.addClientPlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">{pageCopy.addCompanyLabel}</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={pageCopy.addCompanyPlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">{pageCopy.addServiceLabel}</label>
                <input
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder={pageCopy.addServicePlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">{pageCopy.addAmountLabel}</label>
                  <input
                    type="number"
                    min="0"
                  step="1"
                  required
                  value={serviceAmount}
                    onChange={(e) => setServiceAmount(e.target.value)}
                    placeholder={pageCopy.addAmountPlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Channel</label>
                  <select
                    value={sourceChannel}
                    onChange={(e) => setSourceChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  >
                    {sourceChannelOptions.map((channel) => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Lead Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IndustryConfig['demandRecords'][number]['status'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as IndustryConfig['demandRecords'][number]['priority'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Notes / Context</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Key requirements discussed with client..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeRecordModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {editingRecordId ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
