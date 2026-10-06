import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
export const POST = (request: NextRequest) => fullProductHandler(request, 'begin');
