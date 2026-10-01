import type { Table } from '@tanstack/react-table';
import { useState } from 'react';

import type { CellValue, ExportFormat } from '../../types';
import { exportSheet } from '../../utils/export';

// Exports every filtered + sorted row (not just the visible page) in visible column order.
export function useTableExport<T>(table: Table<T>, title: string, fileName = title) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportAs = async (format: ExportFormat) => {
    const columns = table
      .getVisibleLeafColumns()
      .filter((c) => c.accessorFn && c.columnDef.meta?.export !== false);

    const headers = columns.map((c) =>
      typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id,
    );
    const rows = table.getPrePaginationRowModel().rows.map((row) =>
      columns.map((c): CellValue => {
        const v = c.columnDef.meta?.exportValue?.(row.original) ?? row.getValue(c.id);
        return v == null ? '' : typeof v === 'number' ? v : String(v);
      }),
    );

    setExporting(format);
    setError(null);
    try {
      await exportSheet({ title, headers, rows }, format, fileName);
    } catch {
      setError(`Couldn't export ${format.toUpperCase()}. Try again.`);
    } finally {
      setExporting(null);
    }
  };

  return { exportAs, exporting, error };
}
