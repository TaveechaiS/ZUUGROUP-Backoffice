import { NextRequest } from 'next/server';
import { customerRequestsHandler } from '@/server/customers/request-handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return customerRequestsHandler(request);
}
