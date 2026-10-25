import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createLogger, signInternalContext } from '@novachat-enterprise-erp/common';
import { InMemoryEventBus } from '@novachat-enterprise-erp/events';
import { buildContainer } from './container.js';
import { createApp } from './app.js';
import { InMemoryUserRepository, makeUser } from './test/in-memory-user.repository.js';

const secret = 's'.repeat(32);
const user = makeUser();

const app = createApp(
  buildContainer({
    logger: createLogger('test', 'silent'),
    internalSecret: secret,
    users: new InMemoryUserRepository([user]),
    events: new InMemoryEventBus(),
    sessionResolver: () => ({
      resolve: async (headers) =>
        headers.get('cookie') === 'novachat.session_token=valid'
          ? { session: { id: 's1', expiresAt: new Date('2030-01-01') }, user }
          : null,
    }),
  }),
);

const asGateway = (ctx: Record<string, unknown> = {}) =>
  signInternalContext({ service: 'api-gateway', permissions: [], ...ctx }, secret);

describe('auth-service http', () => {
  it('rejects requests without internal signature', async () => {
    const res = await request(app).get('/api/v1/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user', async () => {
    const res = await request(app).get('/api/v1/me').set(asGateway({ userId: 'u1' }));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('itoje_dollar');
  });

  it('validates profile updates', async () => {
    const res = await request(app).patch('/api/v1/me').set(asGateway({ userId: 'u1' })).send({ username: 'A!' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('verifies sessions for the gateway', async () => {
    const ok = await request(app)
      .post('/internal/sessions/verify')
      .set(asGateway())
      .set('cookie', 'novachat.session_token=valid');
    expect(ok.status).toBe(200);
    expect(ok.body.user.id).toBe('u1');

    const bad = await request(app).post('/internal/sessions/verify').set(asGateway()).set('cookie', 'x=y');
    expect(bad.status).toBe(401);
  });

  it('serves health without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });
});
