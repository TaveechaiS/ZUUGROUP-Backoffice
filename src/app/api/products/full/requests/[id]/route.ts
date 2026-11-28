import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
type Context = { params: Promise<{ id: string }> };
export const GET = async (request: NextRequest, context: Context) =>
  fullProductHandler(request, 'status', (await context.params).id);
export const POST = async (request: NextRequest, context: Context) =>
  fullProductHandler(request, 'commit', (await context.params).id);
export const DELETE = async (request: NextRequest, context: Context) =>
  fullProductHandler(request, 'cancel', (await context.params).id);
