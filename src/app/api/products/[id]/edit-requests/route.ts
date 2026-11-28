import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return fullProductHandler(request, 'begin-edit', id);
}
