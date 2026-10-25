import type { UserRow } from '../db/schema.js';
import type { UserProfilePatch, UserRepository } from '../repositories/user.repository.js';

export const makeUser = (overrides: Partial<UserRow> = {}): UserRow => ({
  id: 'u1',
  name: 'Itoje Dollar',
  email: 'itoje@example.com',
  emailVerified: true,
  image: null,
  username: 'itoje_dollar',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

export class InMemoryUserRepository implements UserRepository {
  constructor(public readonly rows: UserRow[] = []) {}

  async findById(id: string) {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  async findByIds(ids: string[]) {
    return this.rows.filter((r) => ids.includes(r.id));
  }

  async findByUsername(username: string) {
    return this.rows.find((r) => r.username === username) ?? null;
  }

  async update(id: string, patch: UserProfilePatch) {
    const row = this.rows.find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: new Date() });
    return row;
  }
}
