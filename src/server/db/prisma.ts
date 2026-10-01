import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prismaClient) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('ยังไม่ได้กำหนดตัวแปร Environment: DATABASE_URL');
    }

    globalForPrisma.prismaClient = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  return globalForPrisma.prismaClient;
}

export function isClosedDatabaseConnection(error: unknown): boolean {
  return typeof error === 'object' && error !== null &&
    'code' in error && error.code === 'P1017';
}

export async function readWithConnectionRetry<T>(read: (client: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await read(getPrismaClient());
  } catch (error) {
    if (!isClosedDatabaseConnection(error)) throw error;
    return read(getPrismaClient());
  }
}
