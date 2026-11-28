import type { NextRequest } from 'next/server';
import { publicMaster } from '@/server/products/public-service';
import { publicResponse } from '../../../_response';

export async function GET(_request: NextRequest, context: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await context.params;
  return publicResponse(() => publicMaster(type, id));
}
