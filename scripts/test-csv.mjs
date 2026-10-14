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
console.log('PASS: CSV quotes commas, escapes quotes, reads link text and badge value');
