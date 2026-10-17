'use client';

import { CategoryBarChart } from '@/components/charts/category-bar-chart';
import { NetProfitChart } from '@/components/charts/net-profit-chart';
import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useIndustry } from '@/context/industry-context';
import { MultiSeriesLineChart, PieSlice } from '@/components/charts/premium-charts';
import { useReportingMetrics } from '@/lib/use-reporting-metrics';
import { formatPercent } from '@/lib/metrics';
import { TablePagination } from '@/components/ui/table-pagination';
import { getSectorPageCopy } from '@/lib/sector-page-copy';
import {
  CircleDollarSign,
  Wallet,
  TrendingUp,
  ReceiptText,
  ArrowUpRight,
  Plus,
  Trash2,
  X,
  PieChart,
} from 'lucide-react';
import { MetricIcon } from '@/components/ui/metric-icon';
import { SmartSuggestionsBanner } from '@/components/dashboard/smart-suggestions-banner';

export default function FinancePage() {
  return <Suspense fallback={<p>Loading finance…</p>}><FinanceContent /></Suspense>;
}

function FinanceContent() {
  const {
    currentIndustry,
    addFinanceTransaction,
    deleteFinanceTransaction,
    periodMode,
  } = useIndustry();
  const metrics = useReportingMetrics();
  const params = useSearchParams();
  const requestedType = params.get('filter');
  const transactionFilter = requestedType === 'income' || requestedType === 'expense' ? requestedType : null;
  const financeTransactions = metrics.transactions;
  const filteredTransactions = financeTransactions.filter(t => !transactionFilter || t.type === transactionFilter);
  const [transactionDate, setTransactionDate] = useState('');
  const recordDate = transactionDate || (metrics.range.valid ? metrics.range.to : '');
  const pageCopy = getSectorPageCopy(currentIndustry.id);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice((validPage - 1) * pageSize, validPage * pageSize);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Operating Expense');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZPay');
  const [reference, setReference] = useState('REF-DEMO-0001');

  const scaledRevenue = metrics.revenue;
  const scaledExpense = metrics.expense;
  const scaledSalesTarget = metrics.salesTarget;
  const scaledExpenseBudget = metrics.expenseBudget;
  const netProfit = metrics.profit;
  const margin = metrics.margin;
  const scaledTrend = metrics.trend;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !recordDate || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return;

    addFinanceTransaction({
      date: recordDate,
      title,
      category,
      type,
      amount: Number(amount),
      paymentMethod,
      reference,
    });

    setIsAddOpen(false);
    setTitle('');
    setAmount('');
    setReference(`REF-DEMO-${String(financeTransactions.length + 2).padStart(4, '0')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <PageHeadingCopy>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentIndustry.color }}
            >
              {currentIndustry.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageCopy.financeTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            P&L performance, operating cost distributions, and verified payment transactions.
          </p>
        </PageHeadingCopy>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: currentIndustry.color }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">
            Total Revenue ({periodMode.toUpperCase()})
          </span><MetricIcon icon={CircleDollarSign} color={currentIndustry.color} /></div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
            {scaledRevenue.toLocaleString()} MMK
          </div>
          <div className="flex items-center gap-1 text-xs font-medium leading-relaxed" style={{ color: currentIndustry.color }}>
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Target: {scaledSalesTarget.toLocaleString()} MMK</span>
          </div>
        </div>

        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4"
          style={{ borderLeftColor: '#ef4444' }}
        >
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">
            Operating Expenses ({periodMode.toUpperCase()})
          </span><MetricIcon icon={Wallet} color={'#ef4444'} /></div>
          <div className="self-center break-words text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
            {scaledExpense.toLocaleString()} MMK
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium leading-relaxed">
            <span>Budget: {scaledExpenseBudget.toLocaleString()} MMK</span>
          </div>
        </div>

        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4"
          style={{ borderLeftColor: netProfit >= 0 ? '#10b981' : '#f43f5e' }}
        >
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">Net Profit</span><MetricIcon icon={TrendingUp} color={netProfit >= 0 ? '#10b981' : '#f43f5e'} /></div>
          <div className={`self-center break-words text-2xl font-bold leading-tight tabular-nums tracking-tight ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {netProfit.toLocaleString()} MMK
          </div>
          <div className="text-xs text-slate-400 font-medium leading-relaxed">
            Margin: {formatPercent(margin)}
          </div>
        </div>

        <div
          className="grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4"
          style={{ borderLeftColor: currentIndustry.color }}
        >
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">Recorded Transactions</span><MetricIcon icon={ReceiptText} color={currentIndustry.color} /></div>
          <div className="self-center text-2xl font-bold leading-tight tabular-nums tracking-tight text-slate-900 dark:text-white">
            {financeTransactions.length}
          </div>
          <div className="text-xs text-emerald-600 font-medium leading-relaxed">
            In selected reporting period
          </div>
        </div>
      </div>

      {/* AI Smart Suggestions */}
      <SmartSuggestionsBanner />

      {/* Visual Analytics Row: Curve + Expense Category Donut Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Financial Trend Visualizer */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue & Expenses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recorded totals by date; longer periods grouped by month
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentIndustry.color }} />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Expense</span>
              </div>
            </div>
          </div>
          <MultiSeriesLineChart
            data={scaledTrend}
            range={metrics.range}
            revenueColor={currentIndustry.color}
            expenseColor="#94a3b8"
            height={240}
          />
        </div>

        {/* Expense Category Donut Pie Chart */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cost Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {scaledExpense.toLocaleString()} MMK
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Operational spend allocation across key cost centers
            </p>

            <div role="region" aria-label="Cost breakdown categories" tabIndex={0} className="h-60 overflow-y-auto overscroll-contain pr-2 focus-visible:outline-2 focus-visible:outline-sky-500 rounded-lg">
            <CategoryBarChart
              data={metrics.expenseCategories.map((item, i): PieSlice => ({
                ...item, color: ['#f43f5e', '#f59e0b', '#8b5cf6', '#64748b', '#0ea5e9'][i % 5],
              }))}
              unit="MMK"
            />
            </div>

          </div>
        </div>
      </div>

      <NetProfitChart transactions={financeTransactions} />

      {/* Transaction Records Table */}
      <div id="transaction-records" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Financial Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recorded {transactionFilter || "income and expenses"} ({filteredTransactions.length} entries)
            </p>
          </div>
        </div>

        {transactionFilter && <div className="mb-4 flex items-center gap-3 text-sm"><span>Showing {transactionFilter} records · Summary metrics cover all period transactions.</span><Link href="/finance#transaction-records" className="text-sky-600 underline">Clear filter</Link></div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">Date</th>
                <th className="py-2.5 font-semibold">Description</th>
                <th className="py-2.5 font-semibold">Category</th>
                <th className="py-2.5 font-semibold">Method</th>
                <th className="py-2.5 font-semibold">Ref Code</th>
                <th className="py-2.5 font-semibold">Amount (MMK)</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTransactions.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">No transactions recorded in this period.</td></tr>}
              {paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {tx.title}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {tx.reference}
                    </td>
                    <td className={`py-3 font-bold font-mono text-[12px] ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteFinanceTransaction(tx.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Log Transaction Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Record Financial Transaction
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <label className="block text-slate-500">Transaction date<input aria-label="Transaction date" type="date" required value={recordDate} onChange={e => setTransactionDate(e.target.value)} min="2024-01-01" max="2026-09-07" className="mt-1 block w-full rounded-xl border p-2" /></label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  + Income (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  - Expense (Cost)
                </button>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Transaction Title / Memo</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Supplier Batch Restock"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Amount (MMK)</label>
                  <input
                    required
                    type="number"
                    min="1"
                  step="1"
                  value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="450000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Operations / Sales"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs"
                  >
                    <option value="KBZPay">KBZPay</option>
                    <option value="WavePay">WavePay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash / POS">Cash / POS</option>
                    <option value="Corporate Card">Corporate Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Voucher / Ref</label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="INV-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
