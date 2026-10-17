const DAY = 86400000;
export function chartTimestamp(label: string): number | null {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(label)) return null;
  const value = Date.parse(`${label.length === 7 ? `${label}-01` : label}T00:00:00Z`);
  return Number.isFinite(value) ? value : null;
}

export function chartTimeAxis(labels: string[], width: number, range?: { from: string; to: string; valid: boolean }) {
  const dates = labels.map(chartTimestamp);
  if (!dates.length || dates.some(date => date === null)) return null;
  const points = dates as number[];
  const monthly = labels.every(label => label.length === 7);
  const requestedStart = range?.valid ? chartTimestamp(monthly ? range.from.slice(0, 7) : range.from) : null;
  const requestedEnd = range?.valid ? chartTimestamp(monthly ? range.to.slice(0, 7) : range.to) : null;
  const start = Math.min(requestedStart ?? Infinity, ...points);
  const end = Math.max(requestedEnd ?? -Infinity, ...points);
  const duration = Math.max(DAY, end - start);
  const position = (time: number) => start === end ? 0.5 : (time - start) / duration;
  const slots = Math.max(1, Math.floor(width / 80));
  const ticks: { time: number; label: string }[] = [];
  const dateFormat = (time: number, options: Intl.DateTimeFormatOptions) => new Date(time).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
  if (monthly || duration > 90 * DAY) {
    const first = new Date(start), last = new Date(end);
    const monthCount = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth() + 1;
    const step = [1, 2, 3, 6, 12, 24, 60].find(value => monthCount / value <= slots) ?? 120;
    const yearly = step >= 12;
    const month = new Date(Date.UTC(first.getUTCFullYear(), yearly ? 0 : first.getUTCMonth(), 1));
    while (month.getTime() <= end) {
      const time = month.getTime();
      if (time >= start) ticks.push({ time, label: dateFormat(time, yearly ? { year: 'numeric' } : { month: 'short', ...(first.getUTCFullYear() !== last.getUTCFullYear() ? { year: '2-digit' } : {}) }) });
      month.setUTCMonth(month.getUTCMonth() + step);
    }
    if (!ticks.length) ticks.push({ time: start, label: dateFormat(start, { month: 'short', year: 'numeric' }) });
  } else {
    const step = [1, 2, 5, 7, 10, 14, 28, 60].find(value => duration / DAY / value <= slots) ?? 60;
    for (let time = start; time <= end; time += DAY) {
      const day = new Date(time).getUTCDate();
      if (time === start || time === end || day === 1 || day % step === 0) ticks.push({ time, label: dateFormat(time, { day: 'numeric', month: 'short' }) });
    }
  }
  // Retain clear boundaries without allowing neighboring labels to collide.
  const spaced: typeof ticks = [];
  for (const tick of ticks) {
    if (!spaced.length || tick.time === end || (position(tick.time) - position(spaced.at(-1)!.time)) * width >= 65) spaced.push(tick);
  }
  if (spaced.length > 1 && (position(spaced.at(-1)!.time) - position(spaced.at(-2)!.time)) * width < 65) spaced.splice(spaced.length - 2, 1);
  return { start, end, positions: points.map(position), ticks: spaced.map(tick => ({ ...tick, position: position(tick.time) })) };
}
