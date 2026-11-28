import AdminDashboard from '@/components/dashboard/admin-dashboard';
import RoleDashboard from '@/components/dashboard/role-dashboard';
import { getCurrentUser } from '@/server/auth/current-user';

export default async function Page() {
  const user = await getCurrentUser();
  return user?.userRole?.roleId === 'ADMIN' ? <AdminDashboard /> : <RoleDashboard />;
}
