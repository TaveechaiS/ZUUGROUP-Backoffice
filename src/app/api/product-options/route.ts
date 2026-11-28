import type { NextRequest } from 'next/server';
import { productOptionsHandler } from '@/server/products/options-handler';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: NextRequest) => productOptionsHandler(request);
export const POST = (request: NextRequest) => productOptionsHandler(request);
export const PATCH = (request: NextRequest) => productOptionsHandler(request);
