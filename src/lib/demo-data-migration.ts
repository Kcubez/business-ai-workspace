/** Three-way seed refresh: replace untouched samples, retain edits/additions/deletions. */
export function refreshSeedRecords<T extends { id: string }>(fresh: T[], previous: T[], saved: T[]): T[] {
  if (!saved.length) return []; // An intentionally emptied collection stays empty.
  const result = new Map(fresh.map(record => [record.id, record]));
  const old = new Map(previous.map(record => [record.id, record]));
  const cached = new Map(saved.map(record => [record.id, record]));
  for (const record of previous) {
    const edited = cached.get(record.id);
    if (!edited) result.delete(record.id);
    else if (JSON.stringify(edited) !== JSON.stringify(record)) result.set(edited.id, edited);
  }
  for (const record of saved) if (!old.has(record.id)) result.set(record.id, record);
  return [...result.values()];
}
