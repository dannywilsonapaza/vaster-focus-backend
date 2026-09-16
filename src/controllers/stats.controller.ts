import { Request, Response, NextFunction } from 'express';
import { StatsService, statsService } from '../services/stats.service.js';

export class StatsController {
  constructor(private service: StatsService = statsService) {}

  getDaily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const stats = await this.service.getDailyStats(userId, req.query as any);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const summary = await this.service.getSummary(userId);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  };
}

export const statsController = new StatsController();
