export type MockRow = {
  ref: string;
  title: string;
  subtitle: string;
  owner: string;
  value: string;
  status: string;
};

export type MockModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  tabs: string[];
  filters: string[];
  metrics: { label: string; value: string; note: string }[];
  columns: [string, string, string, string];
  rows: MockRow[];
};

export const mockRow = (
  ref: string,
  title: string,
  subtitle: string,
  owner: string,
  value: string,
  status: string,
): MockRow => ({ ref, title, subtitle, owner, value, status });

export function createMockConfig(
  title: string,
  description: string,
  action: string,
  columns: MockModuleConfig['columns'],
  rows: MockRow[],
  options?: Partial<Pick<MockModuleConfig, 'eyebrow' | 'tabs' | 'filters' | 'metrics'>>,
): MockModuleConfig {
  return {
    eyebrow: options?.eyebrow ?? 'ข้อมูลจำลอง · สำหรับนำเสนอ',
    title,
    description,
    action,
    tabs: options?.tabs ?? ['ทั้งหมด', 'รอดำเนินการ', 'เสร็จสิ้น'],
    filters: options?.filters ?? ['ทุกหมวด'],
    metrics: options?.metrics ?? [
      { label: 'รายการทั้งหมด', value: '128', note: 'ตัวอย่างข้อมูลในระบบ' },
      { label: 'รอดำเนินการ', value: '12', note: 'ตัวอย่างสถานะงาน' },
      { label: 'อัปเดตล่าสุด', value: 'วันนี้', note: 'ข้อมูลจำลอง' },
    ],
    columns,
    rows: Array.from({ length: 30 }, (_, index) => {
      const seed = rows[index % rows.length];
      const sample = Math.floor(index / rows.length);
      return sample === 0
        ? seed
        : {
            ...seed,
            ref: `${seed.ref}-${String(sample + 1).padStart(2, '0')}`,
            title: `${seed.title} · ตัวอย่าง ${String(sample + 1).padStart(2, '0')}`,
          };
    }),
  };
}
