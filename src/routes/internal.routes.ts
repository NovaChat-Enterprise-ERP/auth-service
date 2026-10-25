import { Router } from 'express';
import { requireService } from '@novachat-enterprise-erp/common';
import type { SessionController } from '../controllers/session.controller.js';
import type { UserController } from '../controllers/user.controller.js';

export const internalRoutes = (sessions: SessionController, users: UserController): Router => {
  const router = Router();
  router.use(requireService);
  router.post('/sessions/verify', sessions.verify);
  router.post('/users/batch', users.batch);
  router.get('/users/:userId', users.getById);
  return router;
};
