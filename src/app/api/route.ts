import {recordCatalog} from '@/server/records/service';
export async function GET(){return Response.json({...await recordCatalog(),dashboard:'/api/dashboard',reports:['/api/reports/sales','/api/reports/inventory','/api/reports/finance']},{headers:{'Cache-Control':'no-store'}});}
