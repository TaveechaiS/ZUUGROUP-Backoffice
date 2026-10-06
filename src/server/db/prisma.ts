import 'server-only';

import { SerializedPrismaPg } from './serialized-pg';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
  prismaSchemaVersion?: string;
};

export function getPrismaClient(): PrismaClient {
  // Next.js dev keeps globalThis across module reloads, including after prisma generate.
  const staleClient = globalForPrisma.prismaClient;
  if (
    staleClient &&
    (globalForPrisma.prismaSchemaVersion !== 'product-full-v1-pg-serial-v1-territory-members-v1' ||
      typeof staleClient.product?.findMany !== 'function' ||
      typeof staleClient.customer?.findMany !== 'function' ||
      typeof staleClient.productLot?.findMany !== 'function')
  ) {
    globalForPrisma.prismaClient = undefined;
    void staleClient.$disconnect().catch(() => {});
  }

  if (!globalForPrisma.prismaClient) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('ยังไม่ได้กำหนดตัวแปร Environment: DATABASE_URL');
    }

    globalForPrisma.prismaClient = new PrismaClient({
      adapter: new SerializedPrismaPg({ connectionString }),
    });
    globalForPrisma.prismaSchemaVersion = 'product-full-v1-pg-serial-v1-territory-members-v1';
  }

  if (typeof globalForPrisma.prismaClient.product?.findMany !== 'function') {
    throw new Error(
      'Prisma Client ไม่มีโมเดลสินค้า กรุณารัน prisma generate และรีสตาร์ต dev server',
    );
  }
  return globalForPrisma.prismaClient;
}

export function isClosedDatabaseConnection(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P1017';
}

export async function readWithConnectionRetry<T>(
  read: (client: PrismaClient) => Promise<T>,
): Promise<T> {
  try {
    return await read(getPrismaClient());
  } catch (error) {
    if (!isClosedDatabaseConnection(error)) throw error;
    return read(getPrismaClient());
  }
}
