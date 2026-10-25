import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '../db/client.js';
import { schema, type UserRow } from '../db/schema.js';
import type { Env } from '../config/env.js';
import type { UserService } from '../services/user.service.js';
import type { ResolvedSession, SessionResolver } from '../services/session.service.js';

export const createBetterAuth = (env: Env, db: Database, userService: UserService) =>
  betterAuth({
    appName: 'NovaChat',
    baseURL: env.PUBLIC_APP_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.PUBLIC_APP_URL],
    database: drizzleAdapter(db, { provider: 'pg', schema, schemaName: 'auth' }),
    emailAndPassword: { enabled: env.AUTH_EMAIL_PASSWORD_ENABLED },
    socialProviders:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
              prompt: 'select_account',
            },
          }
        : {},
    user: {
      additionalFields: {
        username: { type: 'string', required: false, input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => ({
            data: { ...newUser, username: await userService.generateUniqueUsername(newUser.email) },
          }),
        },
      },
    },
    advanced: {
      cookiePrefix: 'novachat',
      useSecureCookies: env.NODE_ENV === 'production',
    },
    telemetry: { enabled: false },
  });

export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;

export class BetterAuthSessionResolver implements SessionResolver {
  constructor(private readonly auth: BetterAuthInstance) {}

  async resolve(headers: Headers): Promise<ResolvedSession | null> {
    const result = await this.auth.api.getSession({ headers });
    if (!result) return null;
    return {
      session: { id: result.session.id, expiresAt: new Date(result.session.expiresAt) },
      user: result.user as unknown as UserRow,
    };
  }
}
