import { INDUSTRIES, IndustryConfig, IndustryId } from '@/data/industries';
import {
  EXTENDED_DEMAND_RECORDS,
  EXTENDED_FINANCE_TRANSACTIONS,
  EXTENDED_CUSTOMER_FOLLOWUPS,
  EXTENDED_QUEUE_ITEMS,
} from '@/data/mock-extended-data';

export function getEnrichedIndustries(): Record<IndustryId, IndustryConfig> {
  const result = { ...INDUSTRIES };

  (Object.keys(result) as IndustryId[]).forEach((id) => {
    const base = result[id];

    const customDemands = EXTENDED_DEMAND_RECORDS[id]?.length
      ? EXTENDED_DEMAND_RECORDS[id]
      : generateAugmentedDemands(base);

    const customFinance = EXTENDED_FINANCE_TRANSACTIONS[id]?.length
      ? EXTENDED_FINANCE_TRANSACTIONS[id]
      : generateAugmentedFinance(base);

    const customFollowUps = EXTENDED_CUSTOMER_FOLLOWUPS[id]?.length
      ? EXTENDED_CUSTOMER_FOLLOWUPS[id]
      : generateAugmentedFollowUps(base);

    const customQueue = EXTENDED_QUEUE_ITEMS[id]?.length
      ? EXTENDED_QUEUE_ITEMS[id]
      : generateAugmentedQueue(base);

    result[id] = {
      ...base,
      demandRecords: withHistoricalDemandRecords(id, customDemands),
      financeTransactions: withHistoricalTransactions(id, customFinance),
      customerFollowUps: withHistoricalFollowUps(id, customFollowUps),
      queueItems: customQueue,
    };
  });

  return result;
}

const HISTORICAL_MONTHS = [
  ...Array.from({ length: 12 }, (_, index) => ({ year: 2025, month: index + 1 })),
  ...Array.from({ length: 8 }, (_, index) => ({ year: 2026, month: index + 1 })),
];

function dateFor(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function withHistoricalTransactions(
  industryId: IndustryId,
  records: IndustryConfig['financeTransactions'],
): IndustryConfig['financeTransactions'] {
  const templates = records.slice(0, 6);
  const generated: IndustryConfig['financeTransactions'] = [];

  HISTORICAL_MONTHS.forEach(({ year, month }, monthIndex) => {
    templates.forEach((template, index) => {
      const growth = 0.68 + monthIndex * 0.018 + (index % 3) * 0.025;
      generated.push({
        ...template,
        id: `history-${industryId}-tx-${year}-${month}-${index + 1}`,
        date: dateFor(year, month, 4 + index * 4),
        title: `${template.title} · ${year}-${String(month).padStart(2, '0')}`,
        amount: Math.max(1, Math.round(template.amount * growth)),
        reference: `H-${industryId.slice(0, 3).toUpperCase()}-${year}${String(month).padStart(2, '0')}-${index + 1}`,
      });
    });
  });

  return [...records, ...generated];
}

function withHistoricalDemandRecords(
  industryId: IndustryId,
  records: IndustryConfig['demandRecords'],
): IndustryConfig['demandRecords'] {
  const templates = records.slice(0, 7);
  const generated: IndustryConfig['demandRecords'] = [];

  HISTORICAL_MONTHS.forEach(({ year, month }, monthIndex) => {
    templates.forEach((template, index) => {
      const createdDate = dateFor(year, month, 3 + index * 3);
      generated.push({
        ...template,
        id: `history-${industryId}-lead-${year}-${month}-${index + 1}`,
        customerName: `${template.customerName} · ${String(month).padStart(2, '0')}/${String(year).slice(-2)}`,
        createdDate,
        followUpDate: dateFor(year, month, Math.min(28, 8 + index * 3)),
        status: index % 5 === 0 ? 'quoted' : index % 3 === 0 ? 'pending' : 'closed',
        serviceAmount: Math.max(1, Math.round(template.serviceAmount * (0.72 + monthIndex * 0.014))),
        note: `Historical ${year}-${String(month).padStart(2, '0')} demo record. ${template.note}`,
      });
    });
  });

  return [...records, ...generated];
}

function withHistoricalFollowUps(
  industryId: IndustryId,
  records: IndustryConfig['customerFollowUps'],
): IndustryConfig['customerFollowUps'] {
  const templates = records.slice(0, 5);
  const generated: IndustryConfig['customerFollowUps'] = [];

  HISTORICAL_MONTHS.forEach(({ year, month }) => {
    templates.forEach((template, index) => {
      const dueDate = dateFor(year, month, 5 + index * 4);
      generated.push({
        ...template,
        id: `history-${industryId}-follow-up-${year}-${month}-${index + 1}`,
        name: `${template.name} · ${String(month).padStart(2, '0')}/${String(year).slice(-2)}`,
        dueDate,
        dueStatus: 'upcoming',
        topic: `${template.topic} · ${year}-${String(month).padStart(2, '0')}`,
        notes: `Historical follow-up record for ${year}-${String(month).padStart(2, '0')}. ${template.notes}`,
      });
    });
  });

  return [...records, ...generated];
}

function generateAugmentedDemands(base: IndustryConfig): IndustryConfig['demandRecords'] {
  const original = base.demandRecords || [];
  if (original.length >= 15) return original;

  const names = [
    'Daw Khin Khin', 'U Aung San', 'Ma May Myat', 'Ko Kyaw Swar',
    'Daw Aye Myint', 'U Kyaw Myint', 'Ma Thida Win', 'Ko Myo Zaw',
    'Daw Hla Hla Than', 'U Tin Tun', 'Ma Cherry Moe', 'Ko Naing Oo',
    'Daw Nu Nu', 'U Myint Soe', 'Ko Min Min Htet', 'Daw San Nwe'
  ];

  // Extract actual channels already used in this industry, or use a curated 4-channel set
  const existingChannels = Array.from(new Set(original.map((r) => r.sourceChannel).filter(Boolean)));
  const channels = existingChannels.length >= 3 ? existingChannels : ['TikTok Shop', 'Facebook Messenger', 'Viber Wholesale', 'Showroom Walk-in'];
  const statuses: ('new' | 'contacted' | 'quoted' | 'pending' | 'closed')[] = ['closed', 'quoted', 'pending', 'new', 'contacted'];

  const extended: IndustryConfig['demandRecords'] = [...original];
  for (let i = original.length; i < 16; i++) {
    const template = original[i % original.length] || {
      serviceName: `${base.name} Standard Service`,
      serviceAmount: 500000,
      serviceQty: 1,
      note: 'Routine customer demand recorded via primary channel.',
    };

    const status = statuses[i % statuses.length];
    const channel = channels[i % channels.length];
    const name = names[i % names.length];
    const day = String(10 + (i % 20)).padStart(2, '0');

    extended.push({
      id: `${base.id}-dm-${i + 1}`,
      customerName: name,
      phone: `094500${1000 + i * 23}`,
      company: i % 3 === 0 ? `${base.name} Client Org` : 'Individual',
      serviceName: `${template.serviceName} (Tier ${((i % 3) + 1)})`,
      serviceAmount: Math.round(template.serviceAmount * (0.8 + (i % 5) * 0.15)),
      serviceQty: Math.max(1, (i % 4) + 1),
      sourceChannel: channel,
      status: status,
      priority: i % 2 === 0 ? 'high' : 'medium',
      followUpDate: `2026-06-${day}`,
      note: `${template.note} • Refined client case #${i + 1}`,
    });
  }

  return extended;
}

function generateAugmentedFinance(base: IndustryConfig): IndustryConfig['financeTransactions'] {
  const original = base.financeTransactions || [];
  if (original.length >= 15) return original;

  const methods = ['KBZPay', 'Bank Transfer', 'Cash', 'CB Pay', 'WavePay', 'AYA Pay'];
  const categoriesIncome = ['Client Payment', 'Service Settlement', 'Retail Sales', 'Direct Revenue'];
  const categoriesExpense = ['Operational Supplies', 'Facility Utilities', 'Vendor Payout', 'Logistics Restock'];

  const extended: IndustryConfig['financeTransactions'] = [...original];
  for (let i = original.length; i < 16; i++) {
    const isIncome = i % 2 === 0;
    const day = String(28 - (i % 15)).padStart(2, '0');
    const category = isIncome
      ? categoriesIncome[i % categoriesIncome.length]
      : categoriesExpense[i % categoriesExpense.length];

    extended.push({
      id: `tx-${base.id}-${i + 1}`,
      date: `2026-06-${day}`,
      title: `${base.name} ${isIncome ? 'Customer Revenue Inflow' : 'Operating Cost Disbursement'} #${i + 1}`,
      category: category,
      type: isIncome ? 'income' : 'expense',
      amount: Math.round((450000 + (i * 185000)) * (isIncome ? 1.4 : 0.9)),
      paymentMethod: methods[i % methods.length],
      reference: `REF-${base.id.slice(0, 3).toUpperCase()}-${2000 + i}`,
    });
  }

  return extended;
}

function generateAugmentedFollowUps(base: IndustryConfig): IndustryConfig['customerFollowUps'] {
  const original = base.customerFollowUps || [];
  if (original.length >= 15) return original;

  const names = [
    'Daw Khin Aye', 'U Thein Zaw', 'Ko Min Thu', 'Ma Su Mon',
    'U Kyaw Myint', 'Daw Hnin Wai', 'Ko Wai Yan', 'Ma Thida Lwin',
    'U Zaw Min', 'Daw Mya Mya', 'Ko Htet Naing', 'Ma Aye Aye Thin',
    'U Win Tin', 'Daw Tin Tin Win', 'Ko Ye Tun', 'Ma Po Po'
  ];

  const channels = ['Phone Call', 'Telegram / SMS', 'Viber', 'Messenger', 'Direct Meeting'];
  const statuses: ('due_today' | 'overdue' | 'upcoming')[] = ['due_today', 'overdue', 'upcoming', 'due_today'];

  const extended: IndustryConfig['customerFollowUps'] = [...original];
  for (let i = original.length; i < 16; i++) {
    const day = String(20 + (i % 10)).padStart(2, '0');
    const status = statuses[i % statuses.length];

    extended.push({
      id: `cf-${base.id}-${i + 1}`,
      name: names[i % names.length],
      phone: `097900${2000 + i * 37}`,
      topic: `${base.name} Care Checkpoint & Consultation #${i + 1}`,
      channel: channels[i % channels.length],
      dueStatus: status,
      dueDate: `2026-06-${day}`,
      notes: `Scheduled review for client inquiry and satisfaction verification.`,
    });
  }

  return extended;
}

function generateAugmentedQueue(base: IndustryConfig): IndustryConfig['queueItems'] {
  const original = base.queueItems || [];
  if (original.length >= 15) return original;

  const names = [
    'PT-1048 • Daw Khin Aye', 'PT-1051 • U Thein Zaw', 'PT-1054 • Ma Hnin Wai', 'PT-1058 • Ko Ye Lin',
    'PT-1062 • Daw San San', 'PT-1065 • U Tin Win', 'PT-1068 • Ma Su Lwin', 'PT-1072 • Ko Kyaw Lin',
    'PT-1075 • Daw Ohnmar', 'PT-1079 • U Ba Tint', 'PT-1082 • Ma Zin Mar', 'PT-1085 • Ko Tun Tun',
    'PT-1089 • Daw Khin Mar', 'PT-1092 • U Soe Naing', 'PT-1096 • Ma Cherry', 'PT-1100 • Ko Sai Lu'
  ];

  const statusTypes: ('success' | 'warning' | 'info' | 'danger')[] = ['success', 'warning', 'info', 'danger'];

  const extended: IndustryConfig['queueItems'] = [...original];
  for (let i = original.length; i < 16; i++) {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '15' : '45';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timeStr = `${String(displayHour).padStart(2, '0')}:${minute} ${ampm}`;

    extended.push({
      col1: names[i % names.length],
      col2: `${base.name} Dedicated Operational Desk #${(i % 4) + 1}`,
      status: i % 3 === 0 ? 'In Progress' : i % 3 === 1 ? 'Waiting Review' : 'Scheduled',
      statusType: statusTypes[i % statusTypes.length],
      col4: timeStr,
    });
  }

  return extended;
}
