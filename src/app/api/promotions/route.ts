import { NextRequest } from 'next/server';
import { promotionsHandler } from '@/server/promotions/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return promotionsHandler(request);
}
export function POST(request: NextRequest) {
  return promotionsHandler(request);
}
