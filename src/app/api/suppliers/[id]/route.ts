import { NextRequest } from 'next/server';
import { purchasingHandler } from '@/server/purchasing/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return purchasingHandler(request, 'suppliers', (await context.params).id);
}
export async function PATCH(request: NextRequest, context: Context) {
  return purchasingHandler(request, 'suppliers', (await context.params).id);
}
export async function DELETE(request: NextRequest, context: Context) {
  return purchasingHandler(request, 'suppliers', (await context.params).id);
}
