import type { NextRequest } from 'next/server';
import { publicProduct } from '@/server/products/public-service';
import { publicResponse } from '../../_response';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return publicResponse(() => publicProduct(id));
}
