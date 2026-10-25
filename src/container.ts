import type { RequestHandler } from 'express';
import type { Logger } from '@novachat-enterprise-erp/common';
import type { EventPublisher } from '@novachat-enterprise-erp/events';
import type { ReadinessCheck } from '@novachat-enterprise-erp/common';
import type { UserRepository } from './repositories/user.repository.js';
import { UserService } from './services/user.service.js';
import { SessionService, type SessionResolver } from './services/session.service.js';
import { UserController } from './controllers/user.controller.js';
import { SessionController } from './controllers/session.controller.js';

export interface ContainerDeps {
  logger: Logger;
  internalSecret: string;
  users: UserRepository;
  events: EventPublisher;
  sessionResolver: (userService: UserService) => SessionResolver;
  authHandler?: (userService: UserService) => RequestHandler;
  readiness?: Record<string, ReadinessCheck>;
}

export const buildContainer = (deps: ContainerDeps) => {
  const userService = new UserService(deps.users, deps.events);
  const sessionService = new SessionService(deps.sessionResolver(userService));
  return {
    logger: deps.logger,
    internalSecret: deps.internalSecret,
    readiness: deps.readiness ?? {},
    authHandler: deps.authHandler?.(userService),
    controllers: {
      users: new UserController(userService),
      sessions: new SessionController(sessionService),
    },
  };
};

export type Container = ReturnType<typeof buildContainer>;
