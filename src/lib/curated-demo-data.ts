import type { IndustryConfig } from '@/data/industries';
import { DEMO_SNAPSHOT_DATE } from './metrics';

const people = ['Daw Hnin Thiri', 'Ko Aung Min', 'Ma Ei Mon', 'U Zaw Lin', 'Daw May Thu', 'Ko Nyi Nyi', 'Ma Thandar Moe', 'U Min Htet', 'Daw Khin Ei', 'Ko Ye Lin', 'Ma Su Hlaing', 'U Thet Naing', 'Daw Thiri Win', 'Ko Wai Phyo', 'Ma Hnin Pwint', 'U Kyaw Myo', 'Daw Ei Sandar', 'Ko Hein Htet', 'Ma Yadanar Win', 'U Aye Ko', 'Daw Nilar Tun', 'Ko Zaw Htet', 'Ma May Nwe', 'U Hla Min'];
const roundMoney = (value: number) => Math.max(1000, Math.round(value / 1000) * 1000);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: string, days: number) => iso(new Date(Date.parse(date) + days * 86400000));
const noise = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;

/** Deterministic fictional transactions; amounts illustrate a demo, not market rates. */
export function curateIndustry(base: IndustryConfig, legacy: IndustryConfig): IndustryConfig {
  const profile = base.demoProfile;
  const sectorSeed = [...base.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const demands: IndustryConfig['demandRecords'] = [];
  const transactions: IndustryConfig['financeTransactions'] = [];
  const followUps: IndustryConfig['customerFollowUps'] = [];
  const channels = [...new Set(legacy.demandRecords.map(record => record.sourceChannel))].filter(Boolean).slice(0, 5);
  const methods = ['Bank Transfer', 'KBZPay', 'Cash', 'WavePay'];
  const legacyIds = (collection: 'demandRecords' | 'financeTransactions' | 'customerFollowUps', year: number, month: number, index: number, kind: string) => {
    if (year === 2026 && month === 6) {
      const originals = legacy[collection].filter(record => !record.id.startsWith('history-'));
      if (originals[index]) return originals[index].id;
    }
    return `history-${base.id}-${kind}-${year}-${month}-${index + 1}`;
  };

  for (let monthIndex = 0; monthIndex < 21; monthIndex++) {
    const year = 2025 + Math.floor(monthIndex / 12), month = monthIndex % 12 + 1;
    const finalDay = year === 2026 && month === 9 ? 7 : new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthKey = `${year}${String(month).padStart(2, '0')}`;
    const season = profile.seasonalFactors[month - 1];
    const count = Math.max(5, Math.round((16 + monthIndex * 0.24 + noise(sectorSeed + monthIndex) * 5) * season * (finalDay === 7 ? 0.3 : 1)));
    const monthly: IndustryConfig['demandRecords'] = [];
    for (let index = 0; index < count; index++) {
      const service = profile.services[(index + monthIndex) % profile.services.length];
      const person = (index + monthIndex * 3 + sectorSeed) % people.length;
      const day = index === 0 ? 1 : Math.min(finalDay, 2 + (index * 7 + monthIndex * 3) % Math.max(1, finalDay - 1));
      const createdDate = iso(new Date(Date.UTC(year, month - 1, day)));
      const statuses: IndustryConfig['demandRecords'][number]['status'][] = ['contacted', 'closed', 'quoted', 'closed', 'pending', 'new', 'closed', 'quoted', 'pending', 'closed'];
      const status = statuses[(index + monthIndex) % statuses.length];
      const serviceAmount = roundMoney(service.price * (0.96 + noise(index + sectorSeed + monthIndex) * 0.12));
      const serviceQty = service.quantity > 4 ? service.quantity + (index % 3 - 1) * 2 : service.quantity;
      const followUpDate = addDays(createdDate, index === 0 ? 2 : 3 + index % 8);
      const invoiceCode = `INV-${base.id.slice(0, 3).toUpperCase()}-${monthKey}-${String(index + 1).padStart(3, '0')}`;
      monthly.push({
        id: legacyIds('demandRecords', year, month, index, 'lead'), createdDate,
        customerName: people[person], phone: `09${String(420000000 + sectorSeed * 100 + person * 137).padStart(9, '0')}`,
        company: service.quantity >= 5 || index % 3 === 0 ? profile.organizations[person % profile.organizations.length] : 'Individual',
        serviceName: service.name, serviceAmount, serviceQty, sourceChannel: channels[index % 10 < 5 ? 0 : index % channels.length] || 'Direct inquiry', status,
        priority: status === 'pending' || index % 7 === 0 ? 'high' : index % 4 === 0 ? 'low' : 'medium', followUpDate,
        note: status === 'closed' ? `Payment received against ${invoiceCode}. ${service.note}` : status === 'quoted' ? `Quotation sent; awaiting confirmation. ${service.note}` : status === 'pending' ? `Confirmation is on hold pending the requested details. ${service.note}` : service.note,
      });
    }
    demands.push(...monthly);

    const monthlyTransactions: IndustryConfig['financeTransactions'] = [];
    const paid = monthly.filter(record => record.status === 'closed');
    paid.forEach(record => {
      const index = monthly.indexOf(record);
      const service = profile.services[(index + monthIndex) % profile.services.length];
      monthlyTransactions.push({
        id: '', date: addDays(record.createdDate!, Math.min(2, finalDay - Number(record.createdDate!.slice(-2)))),
        title: `${record.company === 'Individual' ? record.customerName : record.company} — ${record.serviceName}`,
        category: service.category, type: 'income', amount: record.serviceAmount * record.serviceQty,
        paymentMethod: record.serviceQty >= 5 ? 'Bank Transfer' : methods[index % methods.length],
        reference: `INV-${base.id.slice(0, 3).toUpperCase()}-${monthKey}-${String(index + 1).padStart(3, '0')}`, demandRecordId: record.id,
      });
    });
    // Counter sales and recurring settlements are separate from paid lead invoices.
    const invoiceTotal = monthlyTransactions.reduce((sum, record) => sum + record.amount, 0);
    const revenueGoal = roundMoney(base.targets.salesTarget * (0.69 + monthIndex * 0.015) * season * (0.92 + noise(sectorSeed + monthIndex * 5) * 0.16) * (finalDay === 7 ? 7 / 30 : 1));
    const additionalRevenue = Math.max(0, revenueGoal - invoiceTotal);
    const closingCount = finalDay === 7 ? 2 : 7;
    const weights = Array.from({ length: closingCount }, (_, index) => 0.6 + noise(sectorSeed + monthIndex * 9 + index * 3));
    let allocated = 0;
    weights.forEach((weight, index) => {
      const amount = index === closingCount - 1 ? additionalRevenue - allocated : Math.round(additionalRevenue * weight / weights.reduce((a, b) => a + b, 0) / 1000) * 1000;
      allocated += amount;
      if (amount <= 0) return;
      const service = profile.services[(index + monthIndex + 1) % profile.services.length];
      const day = Math.min(finalDay, 3 + Math.floor(index * (finalDay - 3) / Math.max(1, closingCount - 1)));
      monthlyTransactions.push({ id: '', date: iso(new Date(Date.UTC(year, month - 1, day))), title: `${service.category} — daily closing summary`, category: service.category, type: 'income', amount, paymentMethod: index % 2 ? 'Bank Transfer' : 'KBZPay', reference: `CLS-${base.id.slice(0, 3).toUpperCase()}-${monthKey}-${index + 1}` });
    });
    const costRatio = (monthIndex + sectorSeed) % 7 === 0 ? 1.08 : 0.67 + noise(sectorSeed + monthIndex * 7) * 0.28;
    const costTotal = roundMoney(base.targets.expenseBudget * costRatio * (finalDay === 7 ? 7 / 30 : 1));
    let expensesAllocated = 0;
    profile.expenses.forEach((expense, index) => {
      const amount = index === profile.expenses.length - 1 ? costTotal - expensesAllocated : Math.round(costTotal * expense.weight / 100 / 1000) * 1000;
      expensesAllocated += amount;
      monthlyTransactions.push({ id: '', date: iso(new Date(Date.UTC(year, month - 1, Math.min(finalDay, [6, 14, 25, 21, 28][index])))), title: `${expense.title} — ${expense.supplier}`, category: expense.category, type: 'expense', amount, paymentMethod: 'Bank Transfer', reference: `PAY-${base.id.slice(0, 3).toUpperCase()}-${monthKey}-${index + 1}` });
    });
    monthlyTransactions.sort((a, b) => a.date.localeCompare(b.date));
    monthlyTransactions.forEach((record, index) => { record.id = legacyIds('financeTransactions', year, month, index, 'tx'); });
    transactions.push(...monthlyTransactions);

    const open = monthly.filter(record => record.status !== 'closed');
    const pending = open.slice(0, year === 2026 && month === 6 ? 10 : 3);
    // Ensure at least one outstanding dated record in every reporting month.
    if (pending.length && !pending.some(record => record.followUpDate.slice(0, 7) === `${year}-${String(month).padStart(2, '0')}`)) pending[0].followUpDate = addDays(pending[0].createdDate!, Math.min(1, finalDay - Number(pending[0].createdDate!.slice(-2))));
    pending.forEach((record, index) => {
      const service = profile.services.find(service => service.name === record.serviceName)!;
      followUps.push({ id: legacyIds('customerFollowUps', year, month, index, 'follow-up'), name: record.customerName, phone: record.phone, topic: service.followUp, channel: index % 3 === 0 ? 'Phone Call' : index % 3 === 1 ? 'Email' : 'Messenger', dueStatus: record.followUpDate < DEMO_SNAPSHOT_DATE ? 'overdue' : record.followUpDate === DEMO_SNAPSHOT_DATE ? 'due_today' : 'upcoming', dueDate: record.followUpDate, notes: `${record.company === 'Individual' ? service.note : `${record.company}: ${service.note}`}`, demandRecordId: record.id });
    });
  }

  const queueLeads = demands.filter(record => record.createdDate! >= '2026-06-01' && record.createdDate! <= DEMO_SNAPSHOT_DATE).slice(-12);
  const queueItems = queueLeads.map((record, index): IndustryConfig['queueItems'][number] => {
    const stage = index % 4;
    const statusType = (['success', 'info', 'warning', 'danger'] as const)[stage];
    return {
      col1: base.id === 'clinic' ? `PT-${String(index + 1041)} · ${record.customerName}` : base.id === 'logistics' || base.id === 'factory' ? `${record.company} · ${record.serviceName}` : record.customerName,
      col2: base.id === 'clinic' ? profile.queueStations[index % profile.queueStations.length] : base.id === 'restaurant' ? `${record.serviceQty} guests · ${profile.queueStations[index % profile.queueStations.length]}` : base.id === 'logistics' ? profile.queueStations[index % profile.queueStations.length] : record.serviceName,
      status: profile.queueStages[stage], statusType,
      col4: base.id === 'logistics' ? record.followUpDate : `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '45' : '15'}`,
    };
  });
  return { ...base, demandRecords: demands, financeTransactions: transactions, customerFollowUps: followUps, queueItems };
}
