import { NextRequest } from 'next/server';
import { promotionsHandler } from '@/server/promotions/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return promotionsHandler(request, (await context.params).id);
}
export async function PATCH(request: NextRequest, context: Context) {
  return promotionsHandler(request, (await context.params).id);
}
export async function DELETE(request: NextRequest, context: Context) {
  return promotionsHandler(request, (await context.params).id);
}
