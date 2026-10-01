import {dashboardData} from '@/server/records/reports';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await dashboardData(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:{message:'เชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่'}},{status:503,headers:{'Cache-Control':'no-store'}});}}
