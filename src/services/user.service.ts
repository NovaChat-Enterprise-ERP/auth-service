import { randomInt } from 'node:crypto';
import { EVENTS, type UpdateProfileInput, type UserDto } from '@novachat-enterprise-erp/contracts';
import { ConflictError, NotFoundError } from '@novachat-enterprise-erp/common';
import type { EventPublisher } from '@novachat-enterprise-erp/events';
import type { UserRepository } from '../repositories/user.repository.js';
import { toUserDto } from './user.mapper.js';

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly events: EventPublisher,
  ) {}

  async getById(id: string): Promise<UserDto> {
    const row = await this.users.findById(id);
    if (!row) throw new NotFoundError('User');
    return toUserDto(row);
  }

  async getByIds(ids: string[]): Promise<UserDto[]> {
    const rows = await this.users.findByIds([...new Set(ids)]);
    return rows.map(toUserDto);
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<UserDto> {
    if (input.username) {
      const existing = await this.users.findByUsername(input.username);
      if (existing && existing.id !== id) throw new ConflictError('That username is already taken');
    }
    const row = await this.users.update(id, input);
    if (!row) throw new NotFoundError('User');
    const dto = toUserDto(row);
    await this.events.publish({ type: EVENTS.USER_UPDATED, actorId: id, data: dto });
    return dto;
  }

  async generateUniqueUsername(seed: string): Promise<string> {
    const base =
      seed
        .split('@')[0]!
        .toLowerCase()
        .replace(/[^a-z0-9_.]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24) || 'user';
    const candidate = base.length >= 3 ? base : `${base}_user`;
    if (!(await this.users.findByUsername(candidate))) return candidate;
    for (let attempt = 0; attempt < 10; attempt++) {
      const next = `${candidate}${randomInt(10, 99_999)}`;
      if (!(await this.users.findByUsername(next))) return next;
    }
    return `${candidate}_${Date.now().toString(36)}`;
  }
}
