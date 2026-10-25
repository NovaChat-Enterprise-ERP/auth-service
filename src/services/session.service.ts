import type { SessionVerifyResult } from '@novachat-enterprise-erp/contracts';
import { UnauthorizedError } from '@novachat-enterprise-erp/common';
import type { UserRow } from '../db/schema.js';
import { toUserDto } from './user.mapper.js';

export interface ResolvedSession {
  session: { id: string; expiresAt: Date };
  user: UserRow;
}

export interface SessionResolver {
  resolve(headers: Headers): Promise<ResolvedSession | null>;
}

export class SessionService {
  constructor(private readonly resolver: SessionResolver) {}

  async verify(headers: Headers): Promise<SessionVerifyResult> {
    const resolved = await this.resolver.resolve(headers);
    if (!resolved) throw new UnauthorizedError('Session is missing or expired');
    return {
      user: toUserDto(resolved.user),
      sessionId: resolved.session.id,
      expiresAt: resolved.session.expiresAt.toISOString(),
    };
  }
}
