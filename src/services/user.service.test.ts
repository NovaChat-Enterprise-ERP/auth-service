import { describe, expect, it } from 'vitest';
import { EVENTS } from '@novachat-enterprise-erp/contracts';
import { ConflictError } from '@novachat-enterprise-erp/common';
import { InMemoryEventBus } from '@novachat-enterprise-erp/events';
import { InMemoryUserRepository, makeUser } from '../test/in-memory-user.repository.js';
import { UserService } from './user.service.js';

const setup = () => {
  const repo = new InMemoryUserRepository([
    makeUser(),
    makeUser({ id: 'u2', email: 'ada@example.com', username: 'ada' }),
  ]);
  const events = new InMemoryEventBus();
  return { repo, events, service: new UserService(repo, events) };
};

describe('UserService', () => {
  it('updates the profile and publishes user.updated', async () => {
    const { service, events } = setup();
    const user = await service.updateProfile('u1', { name: 'Itoje' });
    expect(user.name).toBe('Itoje');
    expect(events.ofType(EVENTS.USER_UPDATED)).toHaveLength(1);
  });

  it('rejects a username owned by someone else', async () => {
    const { service } = setup();
    await expect(service.updateProfile('u1', { username: 'ada' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('derives a unique username from an email', async () => {
    const { service } = setup();
    expect(await service.generateUniqueUsername('Grace.Hopper@example.com')).toBe('grace.hopper');
    const taken = await service.generateUniqueUsername('ada@example.com');
    expect(taken).toMatch(/^ada_user$|^ada\d+$/);
  });
});
