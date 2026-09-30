import type { MockRow } from './mock-config';

function storageKey(href: string) {
  return `zuugroup:mock-create:${href}`;
}

export function readMockDrafts(href: string): MockRow[] {
  try {
    const value = window.sessionStorage.getItem(storageKey(href));
    if (!value) return [];
    const rows: unknown = JSON.parse(value);
    if (!Array.isArray(rows)) return [];
    return rows.filter((row): row is MockRow =>
      row !== null && typeof row === 'object' &&
      ['ref', 'title', 'subtitle', 'owner', 'value', 'status'].every((field) => typeof row[field] === 'string'));
  } catch {
    return [];
  }
}

export function addMockDraft(href: string, title: string) {
  const row: MockRow = {
    ref: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    title,
    subtitle: 'รายการสาธิต · ข้อมูลชั่วคราว',
    owner: 'ผู้ใช้ตัวอย่าง',
    value: 'ตัวอย่าง',
    status: 'เพิ่มใน Mock',
  };
  window.sessionStorage.setItem(storageKey(href), JSON.stringify([row, ...readMockDrafts(href)].slice(0, 100)));
}
