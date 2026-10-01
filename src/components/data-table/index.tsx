import { Icon } from '@iconify/react';
import { flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import { useRef } from 'react';

import ActionCell from './action-cell';
import { ACTIONS_COLUMN_ID, useDataTable, useTableExport, useVirtualRows } from './hooks';
import Pagination from './pagination';
import { focusRing } from './styles';
import Toolbar from './toolbar';
import type { DataTableProps } from './types';

export type { CellValue, DataTableProps, ExportFormat, TableAction } from './types';

const ALL_FORMATS = ['csv', 'xlsx', 'pdf'] as const;

const SORT_ICON = { asc: 'lucide:arrow-up', desc: 'lucide:arrow-down' } as const;

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    caption,
    exportFileName,
    exportFormats = [...ALL_FORMATS],
    searchable = true,
    searchPlaceholder = 'Search…',
    onRowClick,
    virtualized = false,
    scrollClassName = 'max-h-[600px]',
    estimateRowHeight,
    onLoadMore,
    hasMore,
    isLoadingMore,
    isLoading = false,
    emptyMessage = 'No results.',
    className,
  } = props;

  const { table, search, setSearch, paginated } = useDataTable(props);
  const { exportAs, exporting, error } = useTableExport(table, caption, exportFileName);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const { visible, padTop, padBottom } = useVirtualRows({
    rows,
    scrollRef,
    enabled: virtualized,
    estimateRowHeight,
    onLoadMore,
    hasMore,
    isLoadingMore,
  });

  const colCount = table.getVisibleLeafColumns().length;
  const getRowActions = table.options.meta?.getRowActions;

  return (
    <div className={clsx('flex flex-col', className)}>
      <Toolbar
        searchable={searchable}
        search={search}
        onSearch={setSearch}
        placeholder={searchPlaceholder}
        formats={exportFormats}
        onExport={exportAs}
        exporting={exporting}
        exportError={error}
      />

      <div
        ref={scrollRef}
        className={clsx('overflow-x-auto', virtualized && ['overflow-y-auto', scrollClassName])}
      >
        <table className="w-full whitespace-nowrap text-body-sm text-body" aria-busy={isLoading || isLoadingMore}>
          <caption className="sr-only">{caption}</caption>
          <thead
            className={clsx(
              'bg-surface-card text-caption-upper font-medium uppercase text-muted',
              virtualized && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const right = h.column.columnDef.meta?.align === 'right';
                  const sorted = h.column.getIsSorted();
                  const label = h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext());
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      colSpan={h.colSpan}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                      }
                      className={clsx(
                        'px-3 py-2 font-medium first:pl-6 last:pr-6',
                        right ? 'text-right' : 'text-left',
                      )}
                    >
                      {h.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={clsx(
                            'inline-flex h-8 items-center gap-1 rounded-xs uppercase',
                            right && 'flex-row-reverse',
                            focusRing,
                          )}
                        >
                          {label}
                          <Icon
                            icon={sorted ? SORT_ICON[sorted] : 'lucide:arrow-up-down'}
                            width={12}
                            height={12}
                            aria-hidden
                            className={clsx(!sorted && 'text-muted-soft')}
                          />
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-t border-hairline-soft">
                  <td colSpan={colCount} className="px-6 py-3">
                    <div className="h-6 rounded-md bg-surface-card motion-safe:animate-pulse" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-10 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {/* Spacers keep the scrollbar honest; height comes from the virtualizer. */}
                {padTop > 0 && (
                  <tr aria-hidden>
                    <td colSpan={colCount} style={{ height: padTop }} />
                  </tr>
                )}
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    onClick={onRowClick && (() => onRowClick(row.original))}
                    className={clsx(
                      'border-t border-hairline-soft',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={clsx(
                          'px-3 py-3 tabular-nums first:pl-6 last:pr-6',
                          cell.column.columnDef.meta?.align === 'right' && 'text-right',
                        )}
                      >
                        {cell.column.id === ACTIONS_COLUMN_ID ? (
                          <ActionCell
                            row={row.original}
                            actions={getRowActions?.(row.original) ?? []}
                          />
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {padBottom > 0 && (
                  <tr aria-hidden>
                    <td colSpan={colCount} style={{ height: padBottom }} />
                  </tr>
                )}
                {isLoadingMore && (
                  <tr className="border-t border-hairline-soft">
                    <td colSpan={colCount} className="px-6 py-3 text-center text-caption text-muted">
                      <span role="status">Loading more…</span>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {paginated && !isLoading && <Pagination table={table} />}
    </div>
  );
}

export default DataTable;
