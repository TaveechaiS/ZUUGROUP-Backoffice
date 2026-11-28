import type { NextRequest } from 'next/server';
import { customerHandler } from '@/server/customers/handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: NextRequest) => customerHandler(request, 'next');
