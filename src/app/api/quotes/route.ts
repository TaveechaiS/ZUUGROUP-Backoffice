import { NextRequest } from 'next/server';
import { quotesHandler } from '@/server/quotes/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return quotesHandler(request);
}
export function POST(request: NextRequest) {
  return quotesHandler(request);
}
