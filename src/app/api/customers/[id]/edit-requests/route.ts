import type { NextRequest } from 'next/server';
import { customerHandler } from '@/server/customers/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const POST = async (request: NextRequest, context: { params: Promise<{ id: string }> }) =>
  customerHandler(request, 'beginEdit', (await context.params).id);
