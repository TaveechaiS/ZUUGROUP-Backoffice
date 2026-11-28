import assert from 'node:assert/strict';
import { createElement } from 'react';
import { toCsv } from '../src/components/reports/csv.ts';

const columns = [
  { key: 'name', label: 'สินค้า', render: (r) => createElement('a', { href: '#' }, r.name) },
  { key: null, label: 'สถานะ', render: (r) => createElement('span', { value: r.status }) },
  { key: 'total', label: 'ยอด "รวม"', render: (r) => r.total },
];
const csv = toCsv(columns, [{ name: 'ยา A, 10mg', status: 'ใช้งาน', total: '1,250.00' }]);
assert.equal(csv, '"สินค้า","สถานะ","ยอด ""รวม"""\r\n"ยา A, 10mg","ใช้งาน","1,250.00"');
assert.equal(
  toCsv(
    [columns[2]],
    [{ total: '=HYPERLINK("x")' }, { total: '-1,250.00' }, { total: '@SUM(A1)' }],
  ),
  `"ยอด ""รวม"""\r\n"'=HYPERLINK(""x"")"\r\n"-1,250.00"\r\n"'@SUM(A1)"`,
);
console.log(
  'PASS: CSV blocks formulas, quotes commas, escapes quotes, reads link text and badge value',
);
