import { NextRequest } from 'next/server';
import { expensesHandler } from '@/server/expenses/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return expensesHandler(request, { fileId: (await context.params).id });
}
