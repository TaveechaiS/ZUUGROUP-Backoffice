import { NextRequest } from 'next/server';
import { expensesHandler } from '@/server/expenses/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return expensesHandler(request);
}
export function POST(request: NextRequest) {
  return expensesHandler(request);
}
