import { NextRequest } from 'next/server';
import {recordHandler} from '@/server/records/handlers';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){return recordHandler(request,'customer-follow-ups',(await params).id,'restore');}
