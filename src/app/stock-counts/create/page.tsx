import {RecordFormPage} from '@/components/pages/record-form-page';
import {requireAdmin} from '@/server/auth/current-user';
export default async function Page(){await requireAdmin();return <RecordFormPage moduleKey="stock-counts"/>;}
