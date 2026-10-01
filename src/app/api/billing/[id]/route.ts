import { NextRequest } from 'next/server';
import {recordHandler} from '@/server/records/handlers';
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
export async function GET(request:NextRequest,context:Context){return recordHandler(request,'billing',(await context.params).id);}
export async function PATCH(request:NextRequest,context:Context){return recordHandler(request,'billing',(await context.params).id);}
export async function DELETE(request:NextRequest,context:Context){return recordHandler(request,'billing',(await context.params).id);}
