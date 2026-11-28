import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
export const POST = async (request: NextRequest, context: { params: Promise<{ id: string }> }) =>
  fullProductHandler(request, 'upload', (await context.params).id);
