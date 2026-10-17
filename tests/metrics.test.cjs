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
