import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { exportUsers } from '@/server/users/service';
import { PaginationError } from '@/server/pagination';
import { RecordError } from '@/server/validation/records';
export async function GET(request: NextRequest) {
  const { error } = await authorizeUserManagement(request);
  if (error) return error;
  try {
    const users = await exportUsers(request.nextUrl.searchParams);
    const safe = (value: string) =>
      `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const lines = [
      [
        'รหัสพนักงาน',
        'ชื่อ',
        'อีเมล',
        'บทบาท',
        'ทีม / เขต',
        'สถานะ',
        'ลบเมื่อ',
        'ลบโดย',
        'เหตุผลการลบ',
      ],
      ...users.map((user) => [
        user.employeeCode,
        user.name,
        user.email,
        user.userRole?.role.name ?? 'ยังไม่มีบทบาท',
        user.team,
        user.deletedAt ? 'ลบแล้ว' : user.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน',
        user.deletedAt ? formatDate(user.deletedAt) : '',
        user.deletedByUser ? `${user.deletedByUser.name} (${user.deletedByUser.employeeCode})` : '',
        user.deleteReason ?? '',
      ]),
    ];
    return new Response('\uFEFF' + lines.map((line) => line.map(safe).join(',')).join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="zuugroup-users.csv"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (caught) {
    return NextResponse.json(
      {
        error:
          caught instanceof PaginationError || caught instanceof RecordError
            ? caught.message
            : 'ส่งออกผู้ใช้งานไม่สำเร็จ',
      },
      { status: caught instanceof PaginationError || caught instanceof RecordError ? 400 : 503 },
    );
  }
}

const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
function formatDate(value: string | null): string {
  return value ? dateTime.format(new Date(value)) : 'ยังไม่เคยเข้าใช้';
}
