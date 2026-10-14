import { NextRequest } from 'next/server';
import { customerRequestsHandler } from '@/server/customers/request-handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return customerRequestsHandler(request, (await context.params).id);
}
export async function PATCH(request: NextRequest, context: Context) {
  return customerRequestsHandler(request, (await context.params).id);
}
