import { NextRequest } from 'next/server';
import { quotesHandler } from '@/server/quotes/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return quotesHandler(request, (await context.params).id);
}
export async function PATCH(request: NextRequest, context: Context) {
  return quotesHandler(request, (await context.params).id);
}
export async function DELETE(request: NextRequest, context: Context) {
  return quotesHandler(request, (await context.params).id);
}
