import type { LucideIcon } from 'lucide-react';

export function MetricIcon({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ color, backgroundColor: `${color}15` }}>
      <Icon className="size-4" />
    </span>
  );
}
