'use client';

import { useIndustry } from '@/context/industry-context';
import { getSectorPageCopy } from '@/lib/sector-page-copy';

export default function HRPage() {
  const { currentIndustry } = useIndustry();
  const pageCopy = getSectorPageCopy(currentIndustry.id);

  const clinicRoster = [
    { name: 'Dr. Aye Myat', role: 'Head of Clinical Services', department: 'Operations', status: 'Active', shifts: 'Morning Shift' },
    { name: 'Dr. Nandar Win', role: 'Senior Dental Surgeon', department: 'Specialists', status: 'Active', shifts: 'Full Day' },
    { name: 'Ma Hnin Yu', role: 'Chief Pharmacist', department: 'Pharmacy', status: 'Active', shifts: 'Evening Shift' },
    { name: 'Ko Min Zaw', role: 'IT Systems & HMS Lead', department: 'Technology', status: 'Active', shifts: 'Flexible' },
    { name: 'Daw San San', role: 'Triage Receptionist', department: 'Front Desk', status: 'On Leave', shifts: 'Covered' },
  ];
  const constructionRoster = [
    { name: 'U Aung Min', role: 'Project Director', department: 'Project Management', status: 'Active', shifts: 'Site Rotation' },
    { name: 'Daw Thiri Hlaing', role: 'Lead Quantity Surveyor (QS)', department: 'BOQ & Cost Control', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Htet Naing', role: 'Senior Site Engineer', department: 'North Dagon Site', status: 'Active', shifts: 'Morning Site Shift' },
    { name: 'U Zaw Lin', role: 'Plant & MEP Subcon Lead', department: 'Heavy Plant & MEP', status: 'Active', shifts: 'Project Based' },
    { name: 'Ma May Zin', role: 'Health & Safety Officer (HSE)', department: 'HSE & Compliance', status: 'Active', shifts: 'Day Shift' },
    { name: 'Ko Wai Yan', role: 'Structural QA/QC Inspector', department: 'Quality Assurance', status: 'Active', shifts: 'Morning Site Shift' },
    { name: 'Daw Khin Aye', role: 'Procurement Specialist', department: 'Materials Procurement', status: 'Active', shifts: 'Full Day' },
    { name: 'U Myo Min', role: 'Excavator & Rigging Foreman', department: 'Site Operations', status: 'On Leave', shifts: 'Covered' },
  ];
  const retailRoster = [
    { name: 'Daw May Thazin', role: 'Store General Manager', department: 'Retail Operations', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Kyaw Swar', role: 'Inventory & Warehouse Lead', department: 'Stock Management', status: 'Active', shifts: 'Morning Shift' },
    { name: 'Ma Cherry Moe', role: 'Senior Cashier & POS Lead', department: 'Front Counter', status: 'Active', shifts: 'Day Shift' },
    { name: 'Ko Hein Thu', role: 'Visual Merchandiser', department: 'Floor Display', status: 'Active', shifts: 'Flexible' },
    { name: 'Daw Nu Nu Win', role: 'Customer Care & Returns Specialist', department: 'After-Sales Desk', status: 'Active', shifts: 'Evening Shift' },
    { name: 'Ko Lin Htet', role: 'Courier Dispatch Coordinator', department: 'Fulfillment & Logistics', status: 'Active', shifts: 'Morning Shift' },
  ];
  const agencyRoster = [
    { name: 'Ko Thura Zaw', role: 'Head of Engineering & AI', department: 'Technical Delivery', status: 'Active', shifts: 'Flexible' },
    { name: 'Daw Ei Phyu', role: 'Senior Project Delivery Manager', department: 'Client Delivery', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Min Khant', role: 'Lead Full-Stack Developer', department: 'Engineering', status: 'Active', shifts: 'Flexible' },
    { name: 'Ma Su Myat', role: 'UI/UX Product Designer', department: 'Design Studio', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Aung Phyo', role: 'Cloud Infrastructure & DevOps', department: 'Operations', status: 'Active', shifts: 'On-Call' },
  ];
  const restaurantRoster = [
    { name: 'Chef Zaw Naing', role: 'Executive Head Chef', department: 'Kitchen & Culinary', status: 'Active', shifts: 'Dinner Shift' },
    { name: 'Daw Hlaing Hlaing', role: 'Restaurant Floor Manager', department: 'Front of House', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Tin Tun', role: 'Sous Chef & Prep Lead', department: 'Kitchen Operations', status: 'Active', shifts: 'Morning Shift' },
    { name: 'Ma Phyu Sin', role: 'VIP Reservations & Hostess', department: 'Guest Relations', status: 'Active', shifts: 'Evening Shift' },
    { name: 'Ko Ye Lin', role: 'Barista & Beverage Captain', department: 'Bar & Service', status: 'Active', shifts: 'Day Shift' },
  ];
  const realestateRoster = [
    { name: 'U Khin Maung', role: 'Principal Broker & Director', department: 'Executive Agency', status: 'Active', shifts: 'Full Day' },
    { name: 'Daw Tin Tin Hla', role: 'Senior Commercial Property Agent', department: 'Commercial Deals', status: 'Active', shifts: 'Client Rotation' },
    { name: 'Ko Myo Thant', role: 'Residential Sales Specialist', department: 'Residential Sales', status: 'Active', shifts: 'Full Day' },
    { name: 'Ma Ei Sandar', role: 'Legal Documentation & Deeds Officer', department: 'Conveyancing', status: 'Active', shifts: 'Morning Shift' },
    { name: 'Ko Min Min', role: 'Site Inspection & Viewing Agent', department: 'Field Operations', status: 'Active', shifts: 'Flexible' },
  ];
  const educationRoster = [
    { name: 'Dr. Kyaw Kyaw Oo', role: 'Dean & Academic Director', department: 'Faculty Administration', status: 'Active', shifts: 'Full Day' },
    { name: 'Daw Ni Ni Lwin', role: 'Lead Technical Instructor', department: 'Software Engineering', status: 'Active', shifts: 'Morning Lectures' },
    { name: 'Ko Aung Kaung', role: 'Student Success & Admissions Officer', department: 'Student Affairs', status: 'Active', shifts: 'Full Day' },
    { name: 'Ma Htet Htet', role: 'LMS & Learning Platform Specialist', department: 'Academic Tech', status: 'Active', shifts: 'Flexible' },
    { name: 'Ko Soe Win', role: 'Laboratory & Classroom Supervisor', department: 'Campus Facilities', status: 'Active', shifts: 'Day Shift' },
  ];

  interface StaffMember {
    name: string;
    role: string;
    department: string;
    status: string;
    shifts: string;
  }

  const genericRoster: StaffMember[] = [
    { name: 'Daw Thiri Win', role: 'Operations Lead', department: 'Operations', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Min Zaw', role: 'Client Success Manager', department: 'Customer Success', status: 'Active', shifts: 'Flexible' },
    { name: 'Ma Hnin Yu', role: 'Finance Officer', department: 'Finance', status: 'Active', shifts: 'Full Day' },
    { name: 'Ko Wai Yan', role: 'Team Supervisor', department: 'Service Delivery', status: 'Active', shifts: 'Day Shift' },
    { name: 'Daw San San', role: 'Administrator', department: 'Administration', status: 'On Leave', shifts: 'Covered' },
  ];

  const rosterMap: Record<string, StaffMember[]> = {
    clinic: clinicRoster,
    logistics: constructionRoster,
    retail: retailRoster,
    agency: agencyRoster,
    restaurant: restaurantRoster,
    realestate: realestateRoster,
    education: educationRoster,
  };

  const staffRoster = currentIndustry.teamMembers ?? rosterMap[currentIndustry.id] ?? genericRoster;
  const activeStaff = staffRoster.filter((member) => member.status === 'Active').length;
  const coveredShifts = staffRoster.filter((member) => member.status !== 'Active').length;
  const departmentCount = new Set(staffRoster.map((member) => member.department)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pageCopy.teamSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Active staff" value={activeStaff} detail={`${staffRoster.length} rostered today`} color={currentIndustry.color} />
        <SummaryCard label="Departments covered" value={departmentCount} detail="Operational coverage mapped" color={currentIndustry.color} />
        <SummaryCard label="Shift coverage" value={coveredShifts === 0 ? 'Full' : `${coveredShifts} covered`} detail={coveredShifts === 0 ? 'All scheduled staff active' : 'Leave coverage is assigned'} color={coveredShifts === 0 ? '#10b981' : '#f59e0b'} />
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Team Members
        </h3>

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
              {staffRoster.map((s, idx) => (
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

function SummaryCard({ label, value, detail, color }: { label: string; value: string | number; detail: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900" style={{ borderLeftColor: color }}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color }}>{detail}</p>
    </div>
  );
}
