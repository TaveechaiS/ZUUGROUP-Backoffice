import { config as loadDotEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadDotEnv({ path: '.env.local' });
loadDotEnv({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? '',
  },
});
