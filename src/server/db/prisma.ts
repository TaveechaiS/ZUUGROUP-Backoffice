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
