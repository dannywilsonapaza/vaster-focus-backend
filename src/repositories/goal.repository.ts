import { prisma } from '../config/prisma.js';
import { Goal } from '@prisma/client';

export class GoalRepository {
  async create(userId: string, data: { title: string }): Promise<Goal> {
    return prisma.goal.create({
      data: {
        userId,
        title: data.title,
      },
    });
  }

  async findAllByUserId(userId: string): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Goal | null> {
    return prisma.goal.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, data: { title?: string; isCompleted?: boolean }): Promise<Goal> {
    return prisma.goal.update({
      where: { id, userId },
      data,
    });
  }

  async findManyByIdsAndUserId(ids: string[], userId: string): Promise<Goal[]> {
    if (ids.length === 0) return [];
    return prisma.goal.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  }
}

export const goalRepository = new GoalRepository();
