import { isValidElement, type ReactNode } from 'react';

type Row = Record<string, unknown>;
type Column = { key: string | null; label: string; render: (row: Row) => ReactNode };

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (isValidElement<{ children?: ReactNode; value?: unknown }>(node))
    return typeof node.props.value === 'string' ? node.props.value : textOf(node.props.children);
  return '';
}

const cell = (value: string) => `"${value.replace(/"/g, '""').replace(/\s+/g, ' ').trim()}"`;

export function toCsv(columns: Column[], rows: Row[]) {
  return [
    columns.map((column) => cell(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => cell(textOf(column.render(row)))).join(',')),
  ].join('\r\n');
}

export function downloadCsv(title: string, columns: Column[], rows: Row[]) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  const blob = new Blob(['﻿' + toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
