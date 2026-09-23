import { GoalRepository, goalRepository } from '../repositories/goal.repository.js';
import { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schema.js';
import { AppError } from '../errors/AppError.js';
import { Goal } from '@prisma/client';

export class GoalService {
  constructor(private repo: GoalRepository = goalRepository) {}

  async createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
    return this.repo.create(userId, { title: input.title });
  }

  async listGoals(userId: string): Promise<Goal[]> {
    return this.repo.findAllByUserId(userId);
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    const existing = await this.repo.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError(404, 'Meta no encontrada');
    }

    return this.repo.update(id, userId, {
      title: input.title,
      isCompleted: input.isCompleted,
    });
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError(404, 'Meta no encontrada');
    }

    await this.repo.delete(id, userId);
  }
}

export const goalService = new GoalService();
