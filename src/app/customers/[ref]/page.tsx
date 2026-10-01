import {RecordDetailPage} from '@/components/pages/record-detail-page';
export default async function Page({params}:{params:Promise<{ref:string}>}){const values=await params;return <RecordDetailPage moduleKey="customers" id={values.ref}/>;}
