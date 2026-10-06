import type { NextRequest } from 'next/server';
import { customerHandler } from '@/server/customers/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export const GET = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'detail', (await context.params).id);
// PATCH {action:'restore'} brings back a soft-deleted customer; DELETE {reason} soft-deletes.
export const PATCH = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'restore', (await context.params).id);
export const DELETE = async (request: NextRequest, context: Context) =>
  customerHandler(request, 'delete', (await context.params).id);
