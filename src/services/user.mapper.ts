import type { UserDto } from '@novachat-enterprise-erp/contracts';
import type { UserRow } from '../db/schema.js';

export const toUserDto = (row: UserRow): UserDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  username: row.username ?? row.id,
  image: row.image,
  createdAt: row.createdAt.toISOString(),
});
