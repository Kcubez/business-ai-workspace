'use client';

import { useIndustry } from '@/context/industry-context';
import { getSectorPageCopy } from '@/lib/sector-page-copy';

export default function ProjectsInfraPage() {
  const { currentIndustry } = useIndustry();
  const { projectItems } = currentIndustry;
  const pageCopy = getSectorPageCopy(currentIndustry.id);
  const expiringItems = projectItems.filter((item) => item.status === 'Expiring Soon').length;
  const activeItems = projectItems.filter((item) => item.status === 'Active' || item.status === 'In Progress').length;

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
            <span className="text-xs text-slate-500 font-medium">Assets & Expiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageCopy.assetTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pageCopy.assetSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AssetMetric label="Tracked items" value={projectItems.length} detail="Across active operations" color={currentIndustry.color} />
        <AssetMetric label="Active work" value={activeItems} detail="In progress or operational" color={currentIndustry.color} />
        <AssetMetric label="Needs attention" value={expiringItems} detail={expiringItems === 0 ? 'No upcoming expiries' : 'Renewal action required'} color={expiringItems === 0 ? '#10b981' : '#f43f5e'} />
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Tracked Assets & Infrastructure Checklist
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All active items registered for {currentIndustry.name}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">{pageCopy.assetNameHeader}</th>
                <th className="py-2.5 font-semibold">{pageCopy.assetCategoryHeader}</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Renewal / Due Date</th>
                <th className="py-2.5 font-semibold">{pageCopy.assetOwnerHeader}</th>
                <th className="py-2.5 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {projectItems.map((item) => {
                const isExpiring = item.status === 'Expiring Soon';
                const isCompleted = item.status === 'Completed';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${
                          isExpiring
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {item.expiryDate}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {item.owner}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {item.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function AssetMetric({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900" style={{ borderLeftColor: color }}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color }}>{detail}</p>
    </div>
  );
}
