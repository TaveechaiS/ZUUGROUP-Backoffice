import type { NextRequest } from 'next/server';
import { operationsHandler } from '@/server/operations/handlers';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  return operationsHandler(request, 'inventory');
}
export function POST(request: NextRequest) {
  return operationsHandler(request, 'inventory');
}
