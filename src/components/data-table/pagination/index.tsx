import { Icon } from '@iconify/react';
import type { Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { focusRing, iconButton } from '../styles';

export default function Pagination<T>({ table }: { table: Table<T> }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getPrePaginationRowModel().rows.length;
  if (total <= pageSize) return null;

  const from = pageIndex * pageSize + 1;
  const to = Math.min(total, from + pageSize - 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-hairline-soft px-6 py-3 text-caption text-muted"
    >
      <span className="tabular-nums">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={clsx(iconButton, focusRing, 'text-ink')}
        >
          <Icon icon="lucide:chevron-left" width={16} height={16} aria-hidden />
        </button>
        <span className="tabular-nums">
          Page {pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={clsx(iconButton, focusRing, 'text-ink')}
        >
          <Icon icon="lucide:chevron-right" width={16} height={16} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
