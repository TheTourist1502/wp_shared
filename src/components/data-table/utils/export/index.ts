import type { CellValue, ExportFormat } from '../../types';

export interface ExportSheet {
  title: string;
  headers: string[];
  rows: CellValue[][];
}

// Strings starting with these run as formulas when the file opens in Excel/Sheets.
const FORMULA_START = /^[=+\-@\t\r]/;

export function safeCell(value: CellValue): CellValue {
  if (typeof value === 'number') return value;
  return FORMULA_START.test(value) && Number.isNaN(Number(value)) ? `'${value}` : value;
}

function csvCell(value: CellValue) {
  const s = String(safeCell(value));
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv({ headers, rows }: ExportSheet) {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// xlsx and pdf libs are loaded on first use so they stay out of the entry chunk.
export async function exportSheet(sheet: ExportSheet, format: ExportFormat, fileName: string) {
  if (format === 'csv') {
    // BOM so Excel reads UTF-8 (currency symbols, names) correctly.
    const blob = new Blob(['﻿', toCsv(sheet)], { type: 'text/csv;charset=utf-8' });
    download(blob, `${fileName}.csv`);
    return;
  }

  if (format === 'xlsx') {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const header = sheet.headers.map((value) => ({ value, fontWeight: 'bold' as const }));
    const body = sheet.rows.map((r) => r.map((v) => ({ value: safeCell(v) })));
    await writeXlsxFile([header, ...body], { sheet: sheet.title.slice(0, 31) }).toFile(
      `${fileName}.xlsx`,
    );
    return;
  }

  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ orientation: sheet.headers.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text(sheet.title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [sheet.headers],
    body: sheet.rows.map((r) => r.map(String)),
    styles: { fontSize: 9 },
  });
  doc.save(`${fileName}.pdf`);
}
