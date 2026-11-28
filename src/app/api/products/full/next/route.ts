import type { NextRequest } from 'next/server';
import { fullProductHandler } from '@/server/products/full-handler';
export const GET = (request: NextRequest) => fullProductHandler(request, 'next');
