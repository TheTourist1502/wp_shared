import type { ColumnDef, RowData, SortingState } from '@tanstack/react-table';

/** One button in the action column. `icon` is an Iconify name, e.g. `lucide:pencil`. */
export interface TableAction<T> {
  icon: string;
  label: string;
  command: (row: T) => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export type CellValue = string | number;

declare module '@tanstack/react-table' {
  // Type params must match TanStack's declaration for the merge to work.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'right';
    /** Value written to CSV/Excel/PDF. Defaults to the accessor value. */
    exportValue?: (row: TData) => CellValue | null | undefined;
    /** Set false to leave the column out of exports. */
    export?: boolean;
  }

  interface TableMeta<TData extends RowData> {
    getRowActions?: (row: TData) => TableAction<TData>[];
  }
}

export interface DataTableProps<T> {
  data: T[];
  // TanStack column value types differ per column; `any` is its documented array type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  /** Actions shown in the trailing column, computed per row. */
  getRowActions?: (row: T) => TableAction<T>[];
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;

  /** Accessible name for the table; also the PDF title. */
  caption: string;
  /** File name without extension. Defaults to `caption`. */
  exportFileName?: string;
  /** Formats offered in the toolbar. Pass `[]` to hide export. */
  exportFormats?: ExportFormat[];

  searchable?: boolean;
  searchPlaceholder?: string;
  initialSorting?: SortingState;
  /** Server-side search: called with the debounced query; client filtering turns off. */
  onSearchChange?: (query: string) => void;
  /** Server-side sort: called on every sort change; client sorting turns off. */
  onSortingChange?: (sorting: SortingState) => void;

  /** Client pagination page size (ignored when `virtualized`). Default 20. */
  pageSize?: number;

  /** Render only the visible rows inside a scroll container. */
  virtualized?: boolean;
  /** Height of the scroll container when virtualized. Default `max-h-[600px]`. */
  scrollClassName?: string;
  estimateRowHeight?: number;
  /** Lazy loading: called when the user scrolls near the last row. Needs `virtualized`. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;

  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}
