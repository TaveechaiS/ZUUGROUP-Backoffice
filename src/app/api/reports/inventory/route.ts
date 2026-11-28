import { reportData, reportFilters, reportConfig, reportKey } from '@/server/records/reports';
import { RecordError } from '@/server/records/service';
import { resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const key = reportKey('inventory'),
      params = new URL(request.url).searchParams;
    const query = resourceQuery(params, ['filters', 'config']);
    const metadata = (part: string) =>
      part === 'filters' ? reportFilters(key) : reportConfig(key);
    const result = query.view
      ? await metadata(query.view)
      : await (async () => {
          const [list, entries] = await Promise.all([
            reportData(key, params),
            Promise.all(query.include.map(async (part) => [part, (await metadata(part)).data])),
          ]);
          return { ...list, ...Object.fromEntries(entries) };
        })();
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      {
        error: {
          message:
            e instanceof RecordError || e instanceof ResourceQueryError
              ? e.message
              : 'โหลดรายงานไม่สำเร็จ',
        },
      },
      { status: e instanceof RecordError || e instanceof ResourceQueryError ? e.status : 503 },
    );
  }
}
