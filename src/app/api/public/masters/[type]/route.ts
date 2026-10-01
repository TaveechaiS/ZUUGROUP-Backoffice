import type { NextRequest } from 'next/server';
import { publicMasterList } from '@/server/products/public-service';
import { publicResponse } from '../../_response';

export async function GET(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  return publicResponse(() => publicMasterList(type, request.nextUrl.searchParams));
}
