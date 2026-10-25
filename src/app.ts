import express, { type Express } from 'express';
import {
  errorHandler,
  healthRouter,
  httpLogger,
  internalAuth,
  notFoundHandler,
  requestId,
} from '@novachat-enterprise-erp/common';
import type { Container } from './container.js';
import { userRoutes } from './routes/user.routes.js';
import { internalRoutes } from './routes/internal.routes.js';

export const createApp = (container: Container): Express => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(requestId());
  app.use(httpLogger(container.logger));
  app.use(healthRouter('auth-service', container.readiness));

  if (container.authHandler) app.all('/api/auth/{*splat}', container.authHandler);

  app.use(express.json({ limit: '100kb' }));
  app.use(internalAuth(container.internalSecret));
  app.use('/api/v1', userRoutes(container.controllers.users));
  app.use('/internal', internalRoutes(container.controllers.sessions, container.controllers.users));
  app.use(notFoundHandler);
  app.use(errorHandler(container.logger));
  return app;
};
