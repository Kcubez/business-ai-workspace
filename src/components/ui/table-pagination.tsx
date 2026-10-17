'use client';

import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { useIndustry } from '@/context/industry-context';
import { paginationItems } from '@/lib/pagination';

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ currentPage, totalItems, pageSize, onPageChange }: TablePaginationProps) {
  const { currentIndustry } = useIndustry();
  if (pageSize <= 0 || totalItems <= pageSize) return null;
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const control = 'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pagination-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800';
  return (
    <div style={{ '--pagination-accent': currentIndustry.color } as CSSProperties} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-slate-800">
      <p aria-live="polite" className="text-slate-500 dark:text-slate-400">
        <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{start.toLocaleString()}–{end.toLocaleString()}</span> of{' '}
        <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{totalItems.toLocaleString()}</span> records
      </p>
      <nav aria-label="Table pagination" className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={control} aria-label="Previous page"><ChevronLeft aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Previous</span></button>
        <span className="px-2 text-xs tabular-nums text-slate-500 sm:hidden">Page <strong className="font-semibold text-slate-800 dark:text-slate-200">{page}</strong> of {totalPages}</span>
        <div className="hidden items-center gap-1 sm:flex">
          {paginationItems(page, totalPages).map(item => typeof item === 'string' ? (
            <span key={item} className="flex size-9 items-center justify-center text-slate-400"><Ellipsis aria-hidden="true" className="size-4" /><span className="sr-only">More pages</span></span>
          ) : (
            <button key={item} type="button" aria-label={`Page ${item}`} aria-current={item === page ? 'page' : undefined} onClick={() => onPageChange(item)} className={`${control} w-9 px-0 ${item === page ? 'border-transparent font-semibold text-white hover:opacity-90 dark:text-white' : ''}`} style={item === page ? { backgroundColor: currentIndustry.color, borderColor: currentIndustry.color } : undefined}>{item}</button>
          ))}
        </div>
        <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className={control} aria-label="Next page"><span className="hidden sm:inline">Next</span><ChevronRight aria-hidden="true" className="size-4" /></button>
      </nav>
    </div>
  );
}
