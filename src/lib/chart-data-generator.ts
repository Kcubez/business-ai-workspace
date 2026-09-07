import { PeriodMode } from '@/context/industry-context';

export interface TrendPoint {
  label: string;
  revenue: number;
  expense: number;
  profit: number;
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function generateDynamicTrend({
  baseTrend,
  periodMode,
  selectedYear,
  selectedMonthNum,
  selectedDay,
  customFrom,
  customTo,
  multiplier,
}: {
  baseTrend: TrendPoint[];
  periodMode: PeriodMode;
  selectedYear: number;
  selectedMonthNum: number;
  selectedDay: number;
  customFrom: string;
  customTo: string;
  multiplier: number;
}): TrendPoint[] {
  // Relative baseline profiles (percentages of base values)
  const profileDaily = [0.12, 0.18, 0.35, 0.52, 0.78, 0.65, 0.30];
  const profileMonthly = [0.85, 0.92, 1.05, 0.98, 1.15, 1.22, 1.28];

  const avgRev = baseTrend.reduce((acc, cur) => acc + cur.revenue, 0) / (baseTrend.length || 1);
  const avgExp = baseTrend.reduce((acc, cur) => acc + cur.expense, 0) / (baseTrend.length || 1);

  if (periodMode === 'day') {
    // 7 points across business hours: 09:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00
    // Subtle day-of-month variation factor (e.g. month-end payroll spikes)
    const dayFactor = 0.9 + ((selectedDay % 5) * 0.05);
    const hours = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
    return hours.map((hour, idx) => {
      const factor = (profileDaily[idx] || 0.5) * dayFactor;
      const rev = Math.round(avgRev * 0.14 * factor);
      const exp = Math.round(avgExp * 0.14 * factor * 0.85);
      return {
        label: hour,
        revenue: rev,
        expense: exp,
        profit: rev - exp,
      };
    });
  }

  if (periodMode === 'month') {
    // Dynamically generate dates using the selectedMonthNum and selectedYear
    const monthShort = MONTH_NAMES[selectedMonthNum] || 'Jun';
    // Days of month spread: 01, 05, 10, 15, 20, 25, endOfMonth
    const daysInMonth = new Date(selectedYear, selectedMonthNum, 0).getDate() || 30;
    const dayStamps = [1, 5, 10, 15, 20, 25, daysInMonth];

    return dayStamps.map((d, idx) => {
      const basePoint = baseTrend[idx] || baseTrend[baseTrend.length - 1];
      const factor = profileMonthly[idx] || 1.0;
      const rev = Math.round(basePoint.revenue * multiplier * (factor / 1.05));
      const exp = Math.round(basePoint.expense * (multiplier > 1 ? multiplier * 0.95 : multiplier) * (factor / 1.05));
      return {
        label: `${monthShort} ${String(d).padStart(2, '0')}`,
        revenue: rev,
        expense: exp,
        profit: rev - exp,
      };
    });
  }

  if (periodMode === 'year') {
    // Checkpoints throughout the year
    // For 2026: only up to September 7, 2026
    const checkpoints =
      selectedYear === 2026
        ? [
            { label: "Jan '26", factor: 0.85 },
            { label: "Feb '26", factor: 0.90 },
            { label: "Mar '26", factor: 0.95 },
            { label: "May '26", factor: 1.05 },
            { label: "Jul '26", factor: 1.15 },
            { label: "Aug '26", factor: 1.20 },
            { label: "Sep 07 '26", factor: 1.25 },
          ]
        : [
            { label: `Jan '${String(selectedYear).slice(-2)}`, factor: 0.85 },
            { label: `Mar '${String(selectedYear).slice(-2)}`, factor: 0.95 },
            { label: `May '${String(selectedYear).slice(-2)}`, factor: 1.05 },
            { label: `Jul '${String(selectedYear).slice(-2)}`, factor: 1.15 },
            { label: `Sep '${String(selectedYear).slice(-2)}`, factor: 1.20 },
            { label: `Nov '${String(selectedYear).slice(-2)}`, factor: 1.30 },
            { label: `Dec '${String(selectedYear).slice(-2)}`, factor: 1.45 },
          ];

    return checkpoints.map((cp) => {
      const rev = Math.round(avgRev * 1.8 * cp.factor);
      const exp = Math.round(avgExp * 1.8 * cp.factor * 0.92);
      return {
        label: cp.label,
        revenue: rev,
        expense: exp,
        profit: rev - exp,
      };
    });
  }

  if (periodMode === 'overall') {
    // Multi-year trajectory: 2024 to 2026 (Sep 7)
    const trajectory = [
      { label: '2024 H1', revWeight: 5.2, expWeight: 4.6 },
      { label: '2024 H2', revWeight: 6.4, expWeight: 5.4 },
      { label: '2025 H1', revWeight: 7.1, expWeight: 5.9 },
      { label: '2025 H2', revWeight: 8.5, expWeight: 6.8 },
      { label: '2026 H1', revWeight: 9.6, expWeight: 7.5 },
      { label: '2026 Sep 07', revWeight: 10.4, expWeight: 8.1 },
    ];
    return trajectory.map((point) => {
      const rev = Math.round(avgRev * point.revWeight);
      const exp = Math.round(avgExp * point.expWeight);
      return {
        label: point.label,
        revenue: rev,
        expense: exp,
        profit: rev - exp,
      };
    });
  }

  // Custom date range
  const dStart = new Date(customFrom);
  const dEnd = new Date(customTo);
  const startTime = isNaN(dStart.getTime()) ? new Date('2026-06-01').getTime() : dStart.getTime();
  const endTime = isNaN(dEnd.getTime()) ? new Date('2026-06-30').getTime() : dEnd.getTime();
  const step = Math.max(1, Math.floor((endTime - startTime) / 6));

  const points: TrendPoint[] = [];
  for (let i = 0; i < 7; i++) {
    const curTime = new Date(startTime + i * step);
    const m = MONTH_NAMES[curTime.getMonth() + 1] || 'Jun';
    const day = String(curTime.getDate()).padStart(2, '0');
    const basePoint = baseTrend[i % baseTrend.length];
    const rev = Math.round(basePoint.revenue * multiplier);
    const exp = Math.round(basePoint.expense * multiplier * 0.94);
    points.push({
      label: `${m} ${day}`,
      revenue: rev,
      expense: exp,
      profit: rev - exp,
    });
  }

  return points;
}
