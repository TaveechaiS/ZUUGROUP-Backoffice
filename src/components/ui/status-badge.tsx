type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const tones: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-orange-50 text-orange-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
  neutral: 'bg-slate-50 text-slate-600',
};

const statusTones: Record<string, StatusTone> = {
  ACTIVE: 'success',
  NORMAL: 'success',
  APPROVED: 'success',
  COMPLETED: 'success',
  ปกติ: 'success',
  มี: 'success',
  มีข้อมูล: 'success',
  ใช้งาน: 'success',
  ใช้งานอยู่: 'success',
  พร้อมขาย: 'success',
  อนุมัติแล้ว: 'success',
  จัดส่งครบ: 'success',
  รับครบ: 'success',
  รับครบแล้ว: 'success',
  ตรวจแล้ว: 'success',
  สำเร็จ: 'success',
  บันทึกแล้ว: 'success',
  กำหนดแล้ว: 'success',
  PENDING: 'warning',
  WAITING: 'warning',
  ต่ำกว่าปกติ: 'warning',
  ใกล้หมดอายุ: 'warning',
  ติดตาม: 'warning',
  จัดส่งบางส่วน: 'warning',
  รับบางส่วน: 'warning',
  INACTIVE: 'danger',
  SUSPENDED: 'danger',
  DELETED: 'danger',
  REJECTED: 'danger',
  ERROR: 'danger',
  ต่ำผิดปกติ: 'danger',
  ผิดปกติ: 'danger',
  ไม่ปกติ: 'danger',
  ไม่ใช้งาน: 'danger',
  ระงับ: 'danger',
  ระงับการใช้งาน: 'danger',
  ลบแล้ว: 'danger',
  ไม่อนุมัติ: 'danger',
  ถูกปฏิเสธ: 'danger',
  ผิดพลาด: 'danger',
  เกินกำหนด: 'danger',
  IN_PROGRESS: 'info',
  กำลังจัดเตรียม: 'info',
  กำลังดำเนินการ: 'info',
  เตรียมโครงหน้าแล้ว: 'info',
  ยังไม่ครบกำหนด: 'info',
  DRAFT: 'neutral',
  ร่าง: 'neutral',
  ฉบับร่าง: 'neutral',
  ไม่มี: 'neutral',
  ไม่มีข้อมูล: 'neutral',
  สิ้นสุดแล้ว: 'neutral',
  ยังไม่ระบุ: 'neutral',
  ยังไม่มีบทบาท: 'neutral',
};

function toneFor(value: string): StatusTone {
  const label = value.trim();
  const mapped = Object.hasOwn(statusTones, label)
    ? statusTones[label]
    : Object.hasOwn(statusTones, label.toUpperCase())
      ? statusTones[label.toUpperCase()]
      : undefined;
  if (mapped) return mapped;
  if (label.startsWith('รอ') || label.startsWith('ครบกำหนด')) return 'warning';
  if (label.startsWith('กำลัง')) return 'info';
  return 'neutral';
}

export default function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tones[toneFor(value)]}`}
    >
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />
      <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">{value || '—'}</span>
    </span>
  );
}
