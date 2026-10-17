/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled fixtures. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Execute the production pure TypeScript helpers without a browser or build.
const cache = new Map();
function loadTs(filename) {
  filename = path.resolve(__dirname, '..', filename);
  if (cache.has(filename)) return cache.get(filename);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const fixtureModule = { exports: {} };
  const localRequire = name => {
    if (name.startsWith('@/')) return loadTs(`src/${name.slice(2)}.ts`);
    if (name.startsWith('.')) return loadTs(path.resolve(path.dirname(filename), name + '.ts'));
    return require(name);
  };
  new Function('require', 'module', 'exports', output)(localRequire, fixtureModule, fixtureModule.exports);
  cache.set(filename, fixtureModule.exports);
  return fixtureModule.exports;
}
const { reportingRange, calculateMetrics, percentage, validDate, categoryShares } = loadTs('src/lib/metrics.ts');
const { getEnrichedIndustries } = loadTs('src/lib/extended-data-injector.ts');
const baseSelection = { periodMode: 'month', selectedYear: 2026, selectedMonthNum: 6, selectedDay: 25, customFrom: '2026-06-01', customTo: '2026-06-30' };
const range = changes => reportingRange({ ...baseSelection, ...changes });
const seeds = getEnrichedIndustries();
const sum = (rows, key) => rows.reduce((n, row) => n + row[key], 0);

for (const [sector, seed] of Object.entries(seeds)) {
  test(`${sector}: every requested historical month has dated finance, demand and follow-up data`, () => {
    for (const year of [2025, 2026]) {
      const finalMonth = year === 2025 ? 12 : 8;
      for (let month = 1; month <= finalMonth; month++) {
        const r = range({ selectedYear: year, selectedMonthNum: month });
        const m = calculateMetrics(seed, r);
        assert.ok(m.transactions.length > 0, `${year}-${month}: no finance records`);
        assert.ok(m.demands.length > 0, `${year}-${month}: no demand records`);
        assert.ok(seed.customerFollowUps.some(f => f.dueDate >= r.from && f.dueDate <= r.to), `${year}-${month}: no follow-ups`);
      }
    }
  });
  test(`${sector}: financial chart/category/ledger totals reconcile across periods`, () => {
    for (const periodMode of ['day', 'month', 'year', 'overall', 'custom']) {
      const m = calculateMetrics(seed, range({ periodMode }));
      assert.equal(sum(m.trend, 'revenue'), m.revenue);
      assert.equal(sum(m.trend, 'expense'), m.expense);
      assert.equal(sum(m.incomeCategories, 'value'), m.revenue);
      assert.equal(sum(m.expenseCategories, 'value'), m.expense);
      assert.equal(m.profit, m.revenue - m.expense);
      assert.equal(sum(m.channels, 'value'), m.leads);
      assert.equal(m.active + m.closed, m.leads);
      assert.ok(m.closed <= m.qualified && m.qualified <= m.leads);
      assert.equal(m.revenue, sum(m.transactions.filter(t => t.type === 'income'), 'amount'));
    }
  });
}
test('date validation, leap years and inclusive calendar proration', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(range({}).targetMonths, 1);
  assert.equal(range({ periodMode: 'custom', customFrom: '2026-06-25', customTo: '2026-06-25' }).targetMonths, 1 / 30);
  assert.equal(range({ periodMode: 'month', selectedYear: 2024, selectedMonthNum: 2 }).targetMonths, 1);
  assert.equal(range({ periodMode: 'custom', customFrom: '2026-06-30', customTo: '2026-07-01' }).targetMonths, 1 / 30 + 1 / 31);
  assert.equal(range({ periodMode: 'year' }).to, '2026-09-07');
  for (const customFrom of ['', 'invalid', '2026-07-01']) {
    const r = range({ periodMode: 'custom', customFrom, customTo: '2026-06-01' });
    assert.equal(r.valid, false);
    assert.equal(calculateMetrics(seeds.clinic, r).transactions.length, 0);
    assert.equal(r.targetMonths, 0);
  }
});
test('empty periods never synthesize data or undefined ratios', () => {
  const m = calculateMetrics(seeds.clinic, range({ selectedYear: 2024 }));
  assert.equal(m.revenue, 0); assert.equal(m.leads, 0);
  assert.equal(m.winRate, null); assert.equal(m.margin, null);
  assert.deepEqual(m.trend, []); assert.deepEqual(m.channels, []);
  assert.equal(percentage(120, 100), 120);
});
test('displayed category shares reconcile to 100%, including equal thirds', () => {
  assert.deepEqual(categoryShares([1, 1, 1]), [33.4, 33.3, 33.3]);
  assert.deepEqual(categoryShares([0, 0]), [0, 0]);
  assert.deepEqual(categoryShares([7]), [100]);
  for (const seed of Object.values(seeds)) {
    const m = calculateMetrics(seed, range({}));
    for (const categories of [m.incomeCategories, m.expenseCategories]) {
      assert.equal(categoryShares(categories.map(c => c.value)).reduce((n, value) => n + Math.round(value * 10), 0), 1000);
    }
  }
});
test('independent fixture: creation cohort, quantity, denominator and finance isolation', () => {
  const template = seeds.clinic.demandRecords[0];
  const seed = { ...seeds.clinic, demandRecords: [
    { ...template, id: 'one', status: 'new', createdDate: '2026-06-25', serviceAmount: 100, serviceQty: 3 },
    { ...template, id: 'two', status: 'closed', createdDate: '2026-06-25' },
    { ...template, id: 'three', status: 'quoted', createdDate: '2026-05-31', followUpDate: '2026-06-25' },
  ], financeTransactions: [
    { ...seeds.clinic.financeTransactions[0], id: 'in', date: '2026-06-25', amount: 1000, type: 'income' },
    { ...seeds.clinic.financeTransactions[0], id: 'out', date: '2026-06-25', amount: 400, type: 'expense' },
  ] };
  const m = calculateMetrics(seed, range({}));
  assert.equal(m.leads, 2); assert.equal(m.qualified, 1); assert.equal(m.closed, 1);
  assert.equal(m.winRate, 50); assert.equal(m.closeRate, 100);
  assert.equal(m.pipelineValue, 300); assert.equal(m.profit, 600); assert.equal(m.margin, 60);
  const withoutLead = calculateMetrics({ ...seed, demandRecords: [] }, range({}));
  assert.equal(withoutLead.revenue, 1000);
  const withoutPayment = calculateMetrics({ ...seed, financeTransactions: seed.financeTransactions.slice(1) }, range({}));
  assert.equal(withoutPayment.revenue, 0); assert.equal(withoutPayment.profit, -400);
  assert.equal(withoutPayment.leads, 2);
});

const { calculateInsights, followUpsForPeriod } = loadTs('src/lib/insights.ts');
test('suggestions reconcile to evidence, resolve after mutations, and exclude out-of-period rows', () => {
  const seed = { ...seeds.clinic, targets: { ...seeds.clinic.targets, salesTarget: 1000, expenseBudget: 500 },
    customerFollowUps: [
      { ...seeds.clinic.customerFollowUps[0], id: 'late', dueDate: '2026-06-10' },
      { ...seeds.clinic.customerFollowUps[0], id: 'end', dueDate: '2026-06-30' },
      { ...seeds.clinic.customerFollowUps[0], id: 'outside', dueDate: '2026-07-01' },
    ], financeTransactions: [
      { ...seeds.clinic.financeTransactions[0], id: 'income', date: '2026-06-10', type: 'income', amount: 200 },
      { ...seeds.clinic.financeTransactions[0], id: 'expense', date: '2026-06-10', type: 'expense', amount: 600 },
      { ...seeds.clinic.financeTransactions[0], id: 'outside-tx', date: '2026-07-01', type: 'income', amount: 10000 },
    ] };
  const insights = calculateInsights(seed, range({}));
  assert.equal(insights.length, 3);
  assert.deepEqual(insights.find(i => i.id === 'overdue-follow-ups').recordIds, ['late']);
  assert.deepEqual(followUpsForPeriod(seed, range({})).filter(f => f.dueStatus === 'overdue').map(f => f.id), ['late']);
  assert.match(insights.find(i => i.id === 'income-below-target').description, /800 MMK remaining/);
  assert.deepEqual(insights.find(i => i.id === 'expenses-above-budget').recordIds, ['expense']);
  const resolved = { ...seed, customerFollowUps: seed.customerFollowUps.slice(1), financeTransactions: [
    { ...seed.financeTransactions[0], amount: 1000 }, { ...seed.financeTransactions[1], amount: 500 },
  ] };
  assert.deepEqual(calculateInsights(resolved, range({})), []);
  assert.deepEqual(calculateInsights(seed, range({ periodMode: 'custom', customFrom: '', customTo: '' })), []);
  assert.deepEqual(calculateInsights({ ...resolved, targets: { ...seed.targets, salesTarget: 0, expenseBudget: 0 } }, range({})), []);
});

const { monthComparison } = loadTs('src/lib/month-comparison.ts');
test('month comparison matches partial periods across year and leap-month boundaries', () => {
  const seed = { financeTransactions: [] };
  const compare = to => monthComparison(seed, { valid: true, to });
  assert.deepEqual(compare('2026-01-17').previous, { from: '2025-12-01', to: '2025-12-17', revenue: 0, expenses: 0, profit: 0, count: 0 });
  assert.equal(compare('2024-03-30').previous.to, '2024-02-29');
  assert.equal(compare('2024-02-29').previous.to, '2024-01-31');
  assert.equal(compare('2026-06-30').fullMonth, true);
  assert.equal(monthComparison(seed, { valid: false, to: '' }), null);
});
test('month comparison includes period boundaries and preserves losses and zero baselines', () => {
  const seed = { financeTransactions: [
    { date: '2026-05-01', type: 'income', amount: 100 },
    { date: '2026-05-17', type: 'expense', amount: 100 },
    { date: '2026-05-18', type: 'income', amount: 900 },
    { date: '2026-06-01', type: 'income', amount: 50 },
    { date: '2026-06-17', type: 'expense', amount: 150 },
    { date: '2026-06-18', type: 'income', amount: 900 },
  ] };
  const result = monthComparison(seed, { valid: true, to: '2026-06-17' });
  assert.equal(result.previous.profit, 0);
  assert.equal(result.current.profit, -100);
  assert.equal(result.current.count, 2);
  assert.equal(result.previous.revenue, 100);
});

const { refreshSeedRecords } = loadTs('src/lib/demo-data-migration.ts');
const { getLegacyEnrichedIndustries } = loadTs('src/lib/extended-data-injector.ts');
test('curated samples are deterministic, connected and free of numbered placeholder copy', () => {
  assert.deepEqual(getEnrichedIndustries(), seeds);
  for (const seed of Object.values(seeds)) {
    const leads = new Map(seed.demandRecords.map(record => [record.id, record]));
    for (const key of ['demandRecords', 'financeTransactions', 'customerFollowUps', 'projectItems']) {
      assert.equal(new Set(seed[key].map(record => record.id)).size, seed[key].length, `${seed.id}: duplicate ${key} IDs`);
    }
    for (const record of seed.demandRecords) {
      assert.ok(validDate(record.createdDate));
      assert.ok(validDate(record.followUpDate));
      assert.ok(record.followUpDate >= record.createdDate);
      assert.ok(!/Tier \d|case #|Client Org|checkpoint.*#|Historical \d/i.test(`${record.customerName} ${record.company} ${record.serviceName} ${record.note}`));
    }
    for (const tx of seed.financeTransactions) {
      assert.ok(validDate(tx.date) && tx.date <= '2026-09-07');
      assert.ok(Number.isFinite(tx.amount) && tx.amount > 0);
      if (tx.demandRecordId) {
        const lead = leads.get(tx.demandRecordId);
        assert.equal(lead.status, 'closed');
        assert.equal(tx.amount, lead.serviceAmount * lead.serviceQty);
        assert.ok(tx.date >= lead.createdDate);
        assert.ok(lead.note.includes(tx.reference));
      }
    }
    for (const follow of seed.customerFollowUps) {
      const lead = leads.get(follow.demandRecordId);
      assert.ok(lead && lead.status !== 'closed');
      assert.equal(follow.name, lead.customerName);
      assert.equal(follow.phone, lead.phone);
      assert.equal(follow.dueDate, lead.followUpDate);
    }
    const monthlyRevenues = [1, 2, 3, 4, 5, 6, 7, 8].map(month => calculateMetrics(seed, range({ selectedMonthNum: month })).revenue);
    assert.ok(new Set(monthlyRevenues).size >= 6);
    assert.ok(seed.teamMembers.length >= 5);
    assert.ok(seed.projectItems.some(item => item.status === 'Completed'));
  }
});
test('seed refresh replaces untouched samples while preserving user edits, additions, deletions and empty collections', () => {
  const old = [{ id: 'a', value: 1 }, { id: 'b', value: 2 }, { id: 'c', value: 3 }];
  const fresh = [{ id: 'a', value: 10 }, { id: 'b', value: 20 }, { id: 'c', value: 30 }, { id: 'd', value: 40 }];
  const saved = [{ id: 'a', value: 1 }, { id: 'b', value: 99 }, { id: 'custom', value: 50 }];
  assert.deepEqual(refreshSeedRecords(fresh, old, saved), [{ id: 'a', value: 10 }, { id: 'b', value: 99 }, { id: 'd', value: 40 }, { id: 'custom', value: 50 }]);
  assert.deepEqual(refreshSeedRecords(fresh, old, []), []);
  const legacy = getLegacyEnrichedIndustries();
  for (const id of Object.keys(seeds)) {
    for (const key of ['demandRecords', 'financeTransactions', 'customerFollowUps']) {
      assert.deepEqual(refreshSeedRecords(seeds[id][key], legacy[id][key], legacy[id][key]), seeds[id][key]);
    }
  }
});
const { serializeDemoState, restoreDemoState } = loadTs('src/lib/demo-data-cache.ts');
test('curated cache stores only changes and fits comfortably in browser storage', () => {
  const length = serializeDemoState(seeds).length;
  console.info(`Curated sample cache: ${length.toLocaleString()} characters; ${Object.values(seeds).reduce((n, seed) => n + seed.demandRecords.length + seed.financeTransactions.length + seed.customerFollowUps.length, 0)} records across 8 sectors.`);
  assert.ok(length < 1000);
  assert.deepEqual(restoreDemoState(JSON.parse(serializeDemoState(seeds)), getEnrichedIndustries()), seeds);
});

test('compact cache round-trips edits, deletions, additions and intentionally empty collections', () => {
  const changed = structuredClone(seeds);
  changed.clinic.demandRecords[0].note = 'Saved customer-requested callback';
  changed.clinic.financeTransactions.shift();
  changed.clinic.customerFollowUps = [];
  changed.agency.financeTransactions.push({ ...changed.agency.financeTransactions[0], id: 'user-added-invoice', title: 'Manual invoice' });
  const encoded = serializeDemoState(changed);
  assert.ok(encoded.length < 20000);
  const restored = restoreDemoState(JSON.parse(encoded), getEnrichedIndustries());
  assert.deepEqual(restored, changed);
  assert.deepEqual(restoreDemoState(changed, getEnrichedIndustries()), changed);
  const invalid = restoreDemoState({ schemaVersion: 5, overrides: { clinic: { demandRecords: { upsert: [null], removed: [] } } } }, getEnrichedIndustries());
  assert.deepEqual(invalid.clinic.demandRecords, seeds.clinic.demandRecords);
});

const { chartTimeAxis } = loadTs('src/lib/chart-time-axis.ts');
test('calendar axis preserves elapsed-time spacing and full reporting bounds', () => {
  const axis = chartTimeAxis(['2026-06-03', '2026-06-06', '2026-06-25'], 1000, range({}));
  assert.equal(axis.start, Date.parse('2026-06-01T00:00:00Z'));
  assert.equal(axis.end, Date.parse('2026-06-30T00:00:00Z'));
  assert.ok(Math.abs((axis.positions[1] - axis.positions[0]) / (axis.positions[2] - axis.positions[1]) - 3 / 19) < 1e-10);
  assert.deepEqual(axis.ticks.map(tick => tick.label), ['1 Jun', '5 Jun', '10 Jun', '15 Jun', '20 Jun', '25 Jun', '30 Jun']);
  assert.equal(chartTimeAxis([], 400), null);
  assert.equal(chartTimeAxis(['Monday'], 400), null);
});
test('calendar ticks adapt to mobile, leap years, monthly data and multi-year ranges', () => {
  const labels = ['2026-06-03', '2026-06-25'];
  const mobile = chartTimeAxis(labels, 240, range({}));
  assert.ok(mobile.ticks.length < chartTimeAxis(labels, 1000, range({})).ticks.length);
  assert.equal(mobile.ticks[0].label, '1 Jun');
  assert.equal(mobile.ticks.at(-1).label, '30 Jun');
  const yearly = chartTimeAxis(['2026-01', '2026-03', '2026-09'], 1000, range({ periodMode: 'year' }));
  assert.deepEqual(yearly.ticks.map(tick => tick.label), ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept']);
  const leap = chartTimeAxis(['2024-02-01', '2024-02-29'], 800);
  assert.equal(leap.positions[1], 1);
  const single = chartTimeAxis(['2026-06-25'], 500);
  assert.equal(single.positions[0], 0.5);
  const years = chartTimeAxis(['2020-01', '2026-01'], 300);
  assert.ok(years.ticks.every(tick => /^\d{4}$/.test(tick.label)));
});

test('daily trend includes zero recorded activity on May 1 and month-end without inventing transactions', () => {
  const industry = { ...seeds.clinic, financeTransactions: [{ ...seeds.clinic.financeTransactions[0], date: '2025-05-03', type: 'income', amount: 123000 }] };
  const result = calculateMetrics(industry, range({ selectedYear: 2025, selectedMonthNum: 5 }));
  assert.equal(result.trend.length, 31);
  assert.deepEqual(result.trend[0], { label: '2025-05-01', revenue: 0, expense: 0, profit: 0, hasRecords: false });
  assert.equal(result.trend[2].hasRecords, true);
  assert.equal(result.transactions.length, 1);
  assert.equal(sum(result.trend, 'revenue'), result.revenue);
});
test('yearly monthly series positions December at the right boundary', () => {
  const result = calculateMetrics(seeds.clinic, range({ periodMode: 'year', selectedYear: 2025 }));
  assert.equal(result.trend.length, 12);
  const axis = chartTimeAxis(result.trend.map(point => point.label), 1000, range({ periodMode: 'year', selectedYear: 2025 }));
  assert.equal(axis.positions[0], 0);
  assert.equal(axis.positions.at(-1), 1);
  assert.equal(axis.ticks.at(-1).label, 'Dec');
});

const { paginationItems } = loadTs('src/lib/pagination.ts');
test('pagination stays compact and exposes the current, first and last pages', () => {
  assert.deepEqual(paginationItems(13, 24), [1, 'ellipsis-start', 12, 13, 14, 'ellipsis-end', 24]);
  assert.deepEqual(paginationItems(1, 24), [1, 2, 3, 4, 5, 'ellipsis-end', 24]);
  assert.deepEqual(paginationItems(24, 24), [1, 'ellipsis-start', 20, 21, 22, 23, 24]);
  assert.deepEqual(paginationItems(2, 3), [1, 2, 3]);
  for (let page = 1; page <= 100; page++) {
    const items = paginationItems(page, 100);
    assert.ok(items.length <= 7);
    assert.ok(items.includes(page) && items.includes(1) && items.includes(100));
    const numbers = items.filter(item => typeof item === 'number');
    assert.deepEqual([...numbers].sort((a, b) => a - b), numbers);
    assert.equal(new Set(items).size, items.length);
  }
});
