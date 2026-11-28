import type { NextRequest } from 'next/server';
import { publicProducts } from '@/server/products/public-service';
import { publicResponse } from '../_response';

export async function GET(request: NextRequest) {
  return publicResponse(() => publicProducts(request.nextUrl.searchParams));
}
