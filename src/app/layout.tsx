import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { Poppins, Noto_Sans_Thai } from 'next/font/google';
import { AdminShell } from '@/components/layout/admin-shell';
import { getCurrentUser } from '@/server/auth/current-user';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
   variable: '--font-poppins',
  display: 'swap',
});
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
   variable: '--font-noto-sans-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zuugroup | ระบบหลังบ้าน',
  description: 'ระบบหลังบ้านสำหรับธุรกิจจัดจำหน่ายยาและเวชภัณฑ์ B2B',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = (await headers()).get('x-zuu-pathname');
  const user = pathname === '/login' ? null : await getCurrentUser();
  const account = user ? { name: user.name, role: user.userRole?.role.name ?? '', roleId: user.userRole?.roleId ?? '' } : null;
  return (
    <html lang="th" className={`${poppins.variable} ${notoSansThai.variable}`}>
      <body><AdminShell account={account}>{children}</AdminShell></body>
    </html>
  );
}
