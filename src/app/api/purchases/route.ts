import { NextRequest } from 'next/server';
import { purchasingHandler } from '@/server/purchasing/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return purchasingHandler(request);
}
export function POST(request: NextRequest) {
  return purchasingHandler(request);
}
