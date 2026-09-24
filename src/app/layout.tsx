import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins, Noto_Sans_Thai } from 'next/font/google';
import { AdminShell } from '@/components/layout/admin-shell';
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th" className={`${poppins.variable} ${notoSansThai.variable}`}>
      <body><AdminShell>{children}</AdminShell></body>
    </html>
  );
}
