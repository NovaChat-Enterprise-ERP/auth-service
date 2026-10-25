import type { Request, Response } from 'express';
import type { SessionService } from '../services/session.service.js';

export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  verify = async (req: Request, res: Response) => {
    const headers = new Headers();
    if (req.headers.cookie) headers.set('cookie', req.headers.cookie);
    if (req.headers.authorization) headers.set('authorization', req.headers.authorization);
    res.json(await this.sessions.verify(headers));
  };
}
