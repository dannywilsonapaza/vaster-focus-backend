import { Request, Response, NextFunction } from 'express';
import { SessionService, sessionService } from '../services/session.service.js';

export class SessionController {
  constructor(private service: SessionService = sessionService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const session = await this.service.createSession(userId, req.body);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const sessions = await this.service.listSessions(userId, limit);
      res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  };
}

export const sessionController = new SessionController();
