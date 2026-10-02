import { resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { paginatedAuditEvents, auditFilters } from '@/server/audit-logs/service';
import { PaginationError } from '@/server/pagination';
export async function GET(request: NextRequest) {
  const { error } = await authorizeUserManagement(request, 'ประวัติ');
  if (error) return error;
  try {
    const parts = resourceQuery(request.nextUrl.searchParams, ['filters']);
    if (parts.view)
      return NextResponse.json(await auditFilters(), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    const [list, filters] = await Promise.all([
      paginatedAuditEvents(request.nextUrl.searchParams),
      parts.include.includes('filters') ? auditFilters() : Promise.resolve(undefined),
    ]);
    return NextResponse.json(
      { ...list, ...(filters ? { filters } : {}) },
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  } catch (caught) {
    return NextResponse.json(
      {
        error:
          caught instanceof PaginationError || caught instanceof ResourceQueryError
            ? caught.message
            : 'โหลดประวัติไม่สำเร็จ',
      },
      {
        status:
          caught instanceof PaginationError || caught instanceof ResourceQueryError ? 400 : 503,
      },
    );
  }
}
