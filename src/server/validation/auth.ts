import type { LoginRequest } from '@/types/api/auth';
export function isLoginBody(body: unknown): body is LoginRequest {
  return Boolean(
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'email' in body &&
    typeof body.email === 'string' &&
    'password' in body &&
    typeof body.password === 'string',
  );
}
