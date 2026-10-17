import type { IndustryConfig, IndustryId } from '@/data/industries';
import { getEnrichedIndustries } from './extended-data-injector';

const collections = ['demandRecords', 'financeTransactions', 'customerFollowUps'] as const;
let baseline: Record<IndustryId, IndustryConfig> | undefined;

/** Store only user changes; source-owned demo history stays out of localStorage. */
export function serializeDemoState(state: Record<IndustryId, IndustryConfig>): string {
  baseline ??= getEnrichedIndustries();
  const overrides: Record<string, Record<string, unknown>> = {};
  for (const id of Object.keys(state) as IndustryId[]) {
    const changed: Record<string, unknown> = {};
    for (const key of collections) {
      const source = baseline[id][key];
      const records = state[id][key];
      const original = new Map(source.map(record => [record.id, record]));
      const ids = new Set(records.map(record => record.id));
      const upsert = records.filter(record => JSON.stringify(record) !== JSON.stringify(original.get(record.id)));
      const removed = source.filter(record => !ids.has(record.id)).map(record => record.id);
      if (upsert.length || removed.length) changed[key] = { upsert, removed };
    }
    if (Object.keys(changed).length) overrides[id] = changed;
  }
  return JSON.stringify({ schemaVersion: 5, overrides });
}

/** Rebuild collections before the provider's per-record validation. Supports early full v5 caches. */
export function restoreDemoState(payload: unknown, fresh: Record<IndustryId, IndustryConfig>): Partial<Record<IndustryId, IndustryConfig>> {
  if (!payload || typeof payload !== 'object') return {};
  const root = payload as Record<string, unknown>;
  if (root.schemaVersion !== 5) return payload as Partial<Record<IndustryId, IndustryConfig>>;
  if (!root.overrides || typeof root.overrides !== 'object') return {};
  const result = { ...fresh };
  const overrides = root.overrides as Record<string, unknown>;
  for (const id of Object.keys(fresh) as IndustryId[]) {
    const saved = overrides[id];
    if (!saved || typeof saved !== 'object') continue;
    result[id] = { ...fresh[id] };
    for (const key of collections) {
      const delta = (saved as Record<string, unknown>)[key] as { upsert?: unknown; removed?: unknown } | undefined;
      if (!delta || !Array.isArray(delta.upsert) || !Array.isArray(delta.removed) || !delta.removed.every(value => typeof value === 'string') || !delta.upsert.every(record => record && typeof record === 'object' && typeof record.id === 'string')) continue;
      const merged = new Map<string, unknown>(fresh[id][key].map(record => [record.id, record]));
      delta.removed.forEach(value => merged.delete(value));
      delta.upsert.forEach(record => merged.set(record.id, record));
      // Detailed field validation remains in IndustryProvider and rejects invalid collections.
      Object.assign(result[id], { [key]: [...merged.values()] });
    }
  }
  return result;
}
