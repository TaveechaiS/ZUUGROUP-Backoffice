import type { NextRequest } from 'next/server';
import { customerHandler } from '@/server/customers/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export const GET = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'status', (await context.params).id);
export const POST = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'commit', (await context.params).id);
export const DELETE = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'cancel', (await context.params).id);
