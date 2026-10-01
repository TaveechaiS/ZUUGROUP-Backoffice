import { NextResponse } from 'next/server';
import { PublicApiError } from '@/server/products/public-service';

export async function publicResponse(read: () => Promise<unknown>) {
  try {
    return NextResponse.json(await read(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof PublicApiError ? error.status : 503;
    const message = error instanceof PublicApiError ? error.message : 'อ่านข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง';
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
