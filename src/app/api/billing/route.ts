import { NextRequest } from 'next/server';
import { billingHandler } from '@/server/billing/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return billingHandler(request);
}
export function POST(request: NextRequest) {
  return billingHandler(request);
}
