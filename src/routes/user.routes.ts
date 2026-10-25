import { Router } from 'express';
import { requireUser } from '@novachat-enterprise-erp/common';
import type { UserController } from '../controllers/user.controller.js';

export const userRoutes = (controller: UserController): Router => {
  const router = Router();
  router.use(requireUser);
  router.get('/me', controller.me);
  router.patch('/me', controller.updateMe);
  router.get('/users/:userId', controller.getById);
  router.post('/users/batch', controller.batch);
  return router;
};
