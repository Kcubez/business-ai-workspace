interface ProfitTransaction { date: string; amount: number; type: 'income' | 'expense' }

export function NetProfitChart({ transactions }: { transactions: ProfitTransaction[] }) {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + (transaction.type === 'income' ? transaction.amount : -transaction.amount));
  }
  const months = [...totals].sort(([a], [b]) => a.localeCompare(b));
  const maximum = Math.max(...months.map(([, value]) => Math.abs(value)), 1);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Net Profit</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Recorded income minus expenses within the selected period, grouped by month. Partial months include only selected dates.</p>
        </div>
        <div className="flex gap-4 text-xs text-slate-500"><span>← Loss</span><span>Profit →</span></div>
      </div>
      {months.length === 0 ? <p className="py-12 text-center text-xs text-slate-500">No recorded data in this period</p> : (
        <ul className="space-y-5" aria-label="Monthly net profit in MMK">
          {months.map(([month, value]) => (
            <li key={month} className="grid grid-cols-[5rem_1fr] items-center gap-x-4 gap-y-2 sm:grid-cols-[5rem_1fr_11rem]">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
              <div aria-hidden="true" className="relative h-7 rounded bg-slate-50 dark:bg-slate-800/60">
                <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300 dark:bg-slate-600" />
                <div className={`absolute inset-y-1 rounded-sm ${value < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.abs(value) / maximum * 50}%`, left: value < 0 ? `${50 - Math.abs(value) / maximum * 50}%` : '50%' }} />
              </div>
              <span className={`col-start-2 text-xs font-semibold tabular-nums sm:col-auto sm:text-right ${value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{value > 0 ? '+' : ''}{value.toLocaleString()} MMK</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
