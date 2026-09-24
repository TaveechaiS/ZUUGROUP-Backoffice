import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZUUGROUP | ระบบหลังบ้าน',
  description: 'ระบบหลังบ้านสำหรับธุรกิจจัดจำหน่ายยาและเวชภัณฑ์ B2B',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
