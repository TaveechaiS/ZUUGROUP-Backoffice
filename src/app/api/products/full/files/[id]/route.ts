import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
export const GET = async (request: NextRequest, context: { params: Promise<{ id: string }> }) =>
  fullProductHandler(request, 'file', (await context.params).id);
