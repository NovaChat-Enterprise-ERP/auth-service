import type { Request, Response } from 'express';
import { updateProfileSchema, userIdsSchema } from '@novachat-enterprise-erp/contracts';
import { parse, userContext } from '@novachat-enterprise-erp/common';
import type { UserService } from '../services/user.service.js';

export class UserController {
  constructor(private readonly users: UserService) {}

  me = async (req: Request, res: Response) => {
    res.json(await this.users.getById(userContext(req).userId));
  };

  updateMe = async (req: Request, res: Response) => {
    const input = parse(updateProfileSchema, req.body);
    res.json(await this.users.updateProfile(userContext(req).userId, input));
  };

  getById = async (req: Request, res: Response) => {
    res.json(await this.users.getById(String(req.params.userId)));
  };

  batch = async (req: Request, res: Response) => {
    const { ids } = parse(userIdsSchema, req.body);
    res.json({ items: await this.users.getByIds(ids) });
  };
}
