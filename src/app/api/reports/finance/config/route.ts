import {reportConfig,reportKey} from '@/server/records/reports';
import {RecordError} from '@/server/records/service';
export const dynamic='force-dynamic';
export async function GET(){try{const key=reportKey('finance');return Response.json(await reportConfig(key),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:{message:e instanceof RecordError?e.message:'โหลดรายงานไม่สำเร็จ'}},{status:e instanceof RecordError?e.status:503});}}
