import { NextRequest } from 'next/server';
import { expensesHandler } from '@/server/expenses/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function POST(request: NextRequest, context: Context) {
  return expensesHandler(request, { expenseId: (await context.params).id, upload: true });
}
