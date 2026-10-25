import { toNodeHandler } from 'better-auth/node';
import { createLogger, startServer } from '@novachat-enterprise-erp/common';
import { RedisStreamEventPublisher } from '@novachat-enterprise-erp/events';
import { loadAuthEnv } from './config/env.js';
import { createDatabase } from './db/client.js';
import { DrizzleUserRepository } from './repositories/user.repository.js';
import { BetterAuthSessionResolver, createBetterAuth, type BetterAuthInstance } from './lib/better-auth.js';
import { buildContainer } from './container.js';
import { createApp } from './app.js';

const env = loadAuthEnv();
const logger = createLogger('auth-service', env.LOG_LEVEL);
const { db, pool } = createDatabase(env.DATABASE_URL, (err) =>
  logger.warn({ err }, 'Idle database connection failed; the pool will reconnect'),
);
const events = new RedisStreamEventPublisher({ redisUrl: env.REDIS_URL, source: 'auth-service' });

let auth: BetterAuthInstance | undefined;
const getAuth = (userService: Parameters<typeof createBetterAuth>[2]) =>
  (auth ??= createBetterAuth(env, db, userService));

const container = buildContainer({
  logger,
  internalSecret: env.INTERNAL_SECRET,
  users: new DrizzleUserRepository(db),
  events,
  sessionResolver: (userService) => new BetterAuthSessionResolver(getAuth(userService)),
  authHandler: (userService) => toNodeHandler(getAuth(userService)),
  readiness: { database: async () => void (await pool.query('select 1')) },
});

startServer({
  app: createApp(container),
  port: env.PORT,
  logger,
  onShutdown: [() => events.close(), () => pool.end()],
});
