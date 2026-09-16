import { Request, Response, NextFunction } from 'express';
import { GoalService, goalService } from '../services/goal.service.js';

export class GoalController {
  constructor(private service: GoalService = goalService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const goal = await this.service.createGoal(userId, req.body);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const goals = await this.service.listGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const updated = await this.service.updateGoal(id, userId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };
}

export const goalController = new GoalController();
