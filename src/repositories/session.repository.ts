import { prisma } from '../config/prisma.js';
import { Session, SessionType, SessionStatus } from '@prisma/client';

export interface CreateSessionData {
  type: SessionType;
  status: SessionStatus;
  targetSeconds: number;
  durationSeconds: number;
  startedAt: Date;
  endedAt: Date;
}

export class SessionRepository {
  async findOverlappingWorkSession(
    userId: string,
    startedAt: Date,
    endedAt: Date
  ): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        userId,
        type: 'WORK',
        status: 'COMPLETED',
        startedAt: { lt: endedAt },
        endedAt: { gt: startedAt },
      },
    });
  }

  async createWithGoals(
    userId: string,
    data: CreateSessionData,
    goalIds: string[] = []
  ) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          userId,
          type: data.type,
          status: data.status,
          targetSeconds: data.targetSeconds,
          durationSeconds: data.durationSeconds,
          startedAt: data.startedAt,
          endedAt: data.endedAt,
        },
      });

      if (goalIds.length > 0) {
        await tx.sessionGoal.createMany({
          data: goalIds.map((goalId) => ({
            sessionId: session.id,
            goalId,
          })),
        });
      }

      return tx.session.findUniqueOrThrow({
        where: { id: session.id },
        include: {
          goals: {
            include: {
              goal: true,
            },
          },
        },
      });
    });
  }

  async findAllByUserId(userId: string, limit = 50) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        goals: {
          include: {
            goal: true,
          },
        },
      },
    });
  }
}

export const sessionRepository = new SessionRepository();
