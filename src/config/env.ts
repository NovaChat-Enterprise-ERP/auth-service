import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@novachat-enterprise-erp/common';

const schema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(4001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_EMAIL_PASSWORD_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export type Env = z.infer<typeof schema>;

export const loadAuthEnv = (): Env => loadEnv(schema);
