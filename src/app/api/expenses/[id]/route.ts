import { NextRequest } from 'next/server';
import { expensesHandler } from '@/server/expenses/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return expensesHandler(request, { expenseId: (await context.params).id });
}
export async function PATCH(request: NextRequest, context: Context) {
  return expensesHandler(request, { expenseId: (await context.params).id });
}
export async function DELETE(request: NextRequest, context: Context) {
  return expensesHandler(request, { expenseId: (await context.params).id });
}
