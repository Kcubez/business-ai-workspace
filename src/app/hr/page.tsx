'use client';

import { useState } from 'react';
import { AttentionPanel, ClearAttention, RecordFilters, RecordSelect } from '@/components/ui/record-filters';
import { PageHeadingCopy } from '@/components/ui/page-heading-copy';
import { MetricIcon } from '@/components/ui/metric-icon';
import { Users, Building2, CalendarCheck, type LucideIcon } from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { getSectorPageCopy } from '@/lib/sector-page-copy';

export default function HRPage() {
  const { currentIndustry } = useIndustry();
  const pageCopy = getSectorPageCopy(currentIndustry.id);

  const staffRoster = currentIndustry.teamMembers ?? [];
  const activeStaff = staffRoster.filter((member) => member.status === 'Active').length;
  const unavailable = staffRoster.filter(member => member.status !== 'Active');
  const departmentCount = new Set(staffRoster.map(member => member.department)).size;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [department, setDepartment] = useState('all');
  const [shift, setShift] = useState('all');
  const filteredStaff = staffRoster.filter(member => (status === 'all' || (status === 'unavailable' ? member.status !== 'Active' : member.status === status)) && (department === 'all' || member.department === department) && (shift === 'all' || member.shifts === shift) && `${member.name} ${member.role}`.toLowerCase().includes(search.toLowerCase()));
  const selectMetric = (value: string) => { setStatus(value); setDepartment('all'); setShift('all'); setSearch(''); };

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
            <span className="text-xs text-slate-500 font-medium">Team Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageCopy.teamTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {pageCopy.teamSubtitle}
          </p>
        </PageHeadingCopy>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard onClick={() => selectMetric('Active')} selected={status === 'Active'} icon={Users} label="Active staff" value={activeStaff} detail={`${staffRoster.length} people in the current roster`} color={currentIndustry.color} />
        <SummaryCard onClick={() => selectMetric('all')} selected={status === 'all'} icon={Building2} label="Departments" value={departmentCount} detail="Represented in the roster" color={currentIndustry.color} />
        <SummaryCard onClick={() => selectMetric('unavailable')} selected={status === 'unavailable'} icon={CalendarCheck} label="On leave / unavailable" value={unavailable.length} detail={unavailable.length ? 'Review scheduling and cover' : 'All roster members marked active'} color={unavailable.length ? '#f59e0b' : '#10b981'} />
      </div>

      <AttentionPanel title="Team insights" chartTitle="People by department" reviewTitle="Availability review" subtitle="Current roster snapshot · department counts include all roster members." data={[...new Set(staffRoster.map(member => member.department))].map(value => ({ label: value, value: staffRoster.filter(member => member.department === value).length, color: currentIndustry.color, selected: department === value, onSelect: () => { selectMetric('all'); setDepartment(value); } }))}>
        {unavailable.length ? <ul className="space-y-3">{unavailable.map(member => <li key={member.name} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"><p className="text-xs font-semibold text-slate-900 dark:text-white">{member.name}</p><p className="mt-1 text-xs text-slate-500">{member.department} · {member.shifts}</p><p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">{member.status} · review cover</p></li>)}</ul> : <ClearAttention>All roster members are marked active. Workload and shift cover are not tracked here.</ClearAttention>}
      </AttentionPanel>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Team Members
        </h3>

        <RecordFilters search={search} onSearch={setSearch} placeholder="Search people or roles…" onReset={() => selectMetric('all')} count={filteredStaff.length}>
          <RecordSelect aria-label="Filter staff status" value={status} onValueChange={setStatus}><option value="all">All statuses</option><option value="Active">Active</option><option value="unavailable">On leave / unavailable</option></RecordSelect>
          <RecordSelect aria-label="Filter department" value={department} onValueChange={setDepartment}><option value="all">All departments</option>{[...new Set(staffRoster.map(member => member.department))].map(value => <option key={value}>{value}</option>)}</RecordSelect>
          <RecordSelect aria-label="Filter shift" value={shift} onValueChange={setShift}><option value="all">All shifts</option>{[...new Set(staffRoster.map(member => member.shifts))].map(value => <option key={value}>{value}</option>)}</RecordSelect>
        </RecordFilters>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-semibold">Staff Member</th>
                <th className="py-2.5 font-semibold">Designated Role</th>
                <th className="py-2.5 font-semibold">Department</th>
                <th className="py-2.5 font-semibold">Shift Schedule</th>
                <th className="py-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {!filteredStaff.length && <tr><td colSpan={5} className="py-10 text-center text-slate-500">No staff match these filters.</td></tr>}
              {filteredStaff.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {s.name}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">
                    {s.role}
                  </td>
                  <td className="py-3 text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                      {s.department}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {s.shifts}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {s.status}
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

function SummaryCard({ label, value, detail, color, icon, onClick, selected }: { label: string; value: string | number; detail: string; color: string; icon: LucideIcon; onClick: () => void; selected: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 grid min-h-44 grid-rows-[auto_1fr_auto] gap-3 rounded-2xl border border-slate-200 border-l-4 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <MetricIcon icon={icon} color={color} />
      </div>
      <p className="self-center text-2xl leading-tight tabular-nums tracking-tight font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs leading-relaxed font-medium" style={{ color }}>{detail}</p>
    </button>
  );
}
