import { NextRequest } from 'next/server';
import {recordHandler} from '@/server/records/handlers';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export function GET(request:NextRequest){return recordHandler(request,'sales-territories',undefined,'config');}
