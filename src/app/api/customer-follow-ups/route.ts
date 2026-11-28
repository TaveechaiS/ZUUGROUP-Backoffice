import { NextRequest } from 'next/server';
import { followUpsHandler } from '@/server/follow-ups/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return followUpsHandler(request);
}
export function POST(request: NextRequest) {
  return followUpsHandler(request);
}
