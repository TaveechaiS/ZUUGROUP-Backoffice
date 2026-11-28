import { NextRequest } from 'next/server';
import { reportsHandler } from '@/server/reports/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ view: string }> };
export async function GET(request: NextRequest, context: Context) {
  return reportsHandler(request, 'finance', (await context.params).view);
}
