'use client';

import axios from 'axios';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const client = axios.create({ withCredentials: true });

function apiPath(url: string) {
  const path = url.startsWith('/api/') ? url : `/api/${url.replace(/^\/+/, '')}`;
  if (!path.startsWith('/api/') || path.includes('\\')) {
    throw new HttpError('ที่อยู่ API ไม่ถูกต้อง', 400);
  }
  return path;
}

function errorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const value = data as { error?: string | { message?: string }; message?: string; res_message?: string };
  return (
    (typeof value.error === 'string' ? value.error : value.error?.message) ||
    value.message ||
    value.res_message
  );
}

function fail(error: unknown, redirectOnUnauthorized: boolean): never {
  if (error instanceof HttpError) throw error;
  if (axios.isCancel(error)) throw error;
  if (!axios.isAxiosError(error)) {
    throw new HttpError('เชื่อมต่อระบบไม่ได้ กรุณาตรวจเครือข่ายแล้วลองอีกครั้ง', 0);
  }
  const status = error.response?.status ?? 0;
  if (redirectOnUnauthorized && status === 401 && typeof window !== 'undefined') {
    window.location.replace('/login');
  }
  throw new HttpError(
    errorMessage(error.response?.data) ||
      (status ? 'คำขอไม่สำเร็จ กรุณาลองอีกครั้ง' : 'เชื่อมต่อระบบไม่ได้ กรุณาตรวจเครือข่ายแล้วลองอีกครั้ง'),
    status,
  );
}

export async function Logins<T>(url: string, payload: unknown): Promise<T> {
  try {
    const response = await client.post<T>(apiPath(url), payload);
    return response.data;
  } catch (error) {
    return fail(error, false);
  }
}

export async function Get<T>(url: string, signal?: AbortSignal): Promise<T> {
  try {
    const response = await client.get<T>(apiPath(url), {
      signal,
      headers: { 'Cache-Control': 'no-store' },
    });
    return response.data;
  } catch (error) {
    return fail(error, true);
  }
}

export async function Post<T>(url: string, payload?: unknown): Promise<T> {
  try {
    const response = await client.post<T>(apiPath(url), payload);
    return response.data;
  } catch (error) {
    return fail(error, true);
  }
}

export async function Update<T>(url: string, payload: unknown): Promise<T> {
  try {
    const response = await client.patch<T>(apiPath(url), payload);
    return response.data;
  } catch (error) {
    return fail(error, true);
  }
}

export async function Delete<T>(url: string, payload?: unknown): Promise<T> {
  try {
    const response = await client.delete<T>(apiPath(url), { data: payload });
    return response.data;
  } catch (error) {
    return fail(error, true);
  }
}
