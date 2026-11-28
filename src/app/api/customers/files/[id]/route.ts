import type { NextRequest } from 'next/server';
import { customerHandler } from '@/server/customers/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = async (request: NextRequest, context: { params: Promise<{ id: string }> }) =>
  customerHandler(request, 'file', (await context.params).id);
