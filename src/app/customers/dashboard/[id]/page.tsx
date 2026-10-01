import {RecordDetailPage} from '@/components/pages/record-detail-page';
export default async function Page({params}:{params:Promise<{id:string}>}){const values=await params;return <RecordDetailPage moduleKey="customer-follow-ups" id={values.id}/>;}
