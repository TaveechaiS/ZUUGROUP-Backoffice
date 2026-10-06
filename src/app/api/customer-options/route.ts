import type { NextRequest } from 'next/server';
import { customerOptionsHandler } from '@/server/customers/options-handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: NextRequest) => customerOptionsHandler(request);
export const POST = (request: NextRequest) => customerOptionsHandler(request);
export const PATCH = (request: NextRequest) => customerOptionsHandler(request);
