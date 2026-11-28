import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { RecordError } from '@/server/validation/records';
import type { Actor } from '@/server/operations/service';
import { salesReport } from './sales';
import { inventoryReport } from './inventory';
import { financeReport } from './finance';

const headers = { 'Cache-Control': 'private, no-store' };

export async function reportsHandler(
  request: NextRequest,
  kind: 'sales' | 'inventory' | 'finance',
  view: string,
) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    const params = request.nextUrl.searchParams;
    const result =
      kind === 'sales'
        ? await salesReport(actor, view, params)
        : kind === 'inventory'
          ? await inventoryReport(actor, view, params)
          : await financeReport(actor, view, params);
    return Response.json(result, { headers });
  } catch (error) {
    const known = error instanceof RecordError;
    return Response.json(
      {
        error: {
          message: known ? error.message : 'เชื่อมต่อข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      { status: known ? error.status : 503, headers },
    );
  }
}
