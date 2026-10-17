import type { ReactNode } from 'react';

export function PageHeadingCopy({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2.5 [&>h1]:leading-tight [&>p]:leading-relaxed">
      {children}
    </div>
  );
}
