import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zuugroup | ระบบหลังบ้าน',
  description: 'ระบบหลังบ้านสำหรับธุรกิจจัดจำหน่ายยาและเวชภัณฑ์ B2B',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th">
      <body><AdminShell>{children}</AdminShell></body>
    </html>
  );
}
