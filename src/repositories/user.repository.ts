import { eq, inArray } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { user, type UserRow } from '../db/schema.js';

export interface UserProfilePatch {
  name?: string;
  username?: string;
  image?: string | null;
}

export interface UserRepository {
  findById(id: string): Promise<UserRow | null>;
  findByIds(ids: string[]): Promise<UserRow[]>;
  findByUsername(username: string): Promise<UserRow | null>;
  update(id: string, patch: UserProfilePatch): Promise<UserRow | null>;
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(user).where(eq(user.id, id)).limit(1);
    return row ?? null;
  }

  async findByIds(ids: string[]): Promise<UserRow[]> {
    if (ids.length === 0) return [];
    return this.db.select().from(user).where(inArray(user.id, ids));
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(user).where(eq(user.username, username)).limit(1);
    return row ?? null;
  }

  async update(id: string, patch: UserProfilePatch): Promise<UserRow | null> {
    const [row] = await this.db
      .update(user)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return row ?? null;
  }
}
