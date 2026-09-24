import 'server-only';

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`ยังไม่ได้กำหนดตัวแปร Environment: ${name}`);
  }

  return value;
}
