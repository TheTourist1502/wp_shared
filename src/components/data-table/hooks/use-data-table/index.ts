import {
  type ColumnDef,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { DataTableProps } from '../../types';
import { useDebouncedValue } from '../use-debounced-value';

export const ACTIONS_COLUMN_ID = 'actions';

type Options<T> = Pick<
  DataTableProps<T>,
  | 'data'
  | 'columns'
  | 'getRowActions'
  | 'getRowId'
  | 'initialSorting'
  | 'onSearchChange'
  | 'onSortingChange'
  | 'pageSize'
  | 'virtualized'
>;

// Table instance with global search (debounced 300 ms), per-column sort, optional
// pagination, and the trailing action column when `getRowActions` is set.
export function useDataTable<T>({
  data,
  columns,
  getRowActions,
  getRowId,
  initialSorting = [],
  onSearchChange,
  onSortingChange,
  pageSize = 20,
  virtualized = false,
}: Options<T>) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim(), 300);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  // Notify the server only when the debounced query really changes (not on mount).
  const sentQuery = useRef(query);
  useEffect(() => {
    if (!onSearchChange || sentQuery.current === query) return;
    sentQuery.current = query;
    onSearchChange(query);
  }, [query, onSearchChange]);

  const hasActions = Boolean(getRowActions);
  const allColumns = useMemo<ColumnDef<T>[]>(
    () =>
      hasActions
        ? [
            ...columns,
            {
              id: ACTIONS_COLUMN_ID,
              header: 'Actions',
              enableSorting: false,
              enableGlobalFilter: false,
              meta: { align: 'right', export: false },
            },
          ]
        : columns,
    [columns, hasActions],
  );

  const paginated = !virtualized;

  // TanStack returns fresh functions each render; compiler skipping this hook is intended.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<T>({
    data,
    columns: allColumns,
    getRowId,
    // Read through meta so a new `getRowActions` each render doesn't rebuild columns.
    meta: { getRowActions },
    state: { globalFilter: query, sorting },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      setSorting(next);
      onSortingChange?.(next);
    },
    manualFiltering: Boolean(onSearchChange),
    manualSorting: Boolean(onSortingChange),
    globalFilterFn: 'includesString',
    // Default only searches columns whose first value is a string/number; allow all accessors.
    getColumnCanGlobalFilter: (column) => column.columnDef.enableGlobalFilter !== false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(paginated && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageIndex: 0, pageSize } },
    }),
  });

  return { table, search, setSearch, paginated };
}
