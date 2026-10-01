// Run: npx tsx tests/export.test.ts
import assert from 'node:assert/strict';

import { safeCell, toCsv } from '../src/components/data-table/utils/export';

assert.equal(safeCell('=SUM(A1)'), "'=SUM(A1)");
assert.equal(safeCell('@cmd'), "'@cmd");
assert.equal(safeCell('-12.5'), '-12.5');
assert.equal(safeCell(-3), -3);
assert.equal(safeCell('AAPL'), 'AAPL');

assert.equal(
  toCsv({ title: 't', headers: ['Name', 'Note'], rows: [['A, Inc', 'say "hi"'], ['B', 4]] }),
  'Name,Note\r\n"A, Inc","say ""hi"""\r\nB,4',
);

console.log('export: ok');
