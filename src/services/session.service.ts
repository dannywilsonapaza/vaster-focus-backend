import { SessionRepository, sessionRepository } from '../repositories/session.repository.js';
import { GoalRepository, goalRepository } from '../repositories/goal.repository.js';
import { CreateSessionInput } from '../schemas/session.schema.js';
import { AppError } from '../errors/AppError.js';
import { SessionType, SessionStatus } from '@prisma/client';

export class SessionService {
  constructor(
    private sessionRepo: SessionRepository = sessionRepository,
    private goalRepo: GoalRepository = goalRepository
  ) {}

  async createSession(userId: string, input: CreateSessionInput) {
    const startedAt = new Date(input.startedAt);
    const endedAt = new Date(input.endedAt);

    // 1. Validar metas si fueron proporcionadas
    const goalIds = input.goalIds || [];
    if (goalIds.length > 0) {
      const userGoals = await this.goalRepo.findManyByIdsAndUserId(goalIds, userId);
      if (userGoals.length !== goalIds.length) {
        throw new AppError(400, 'Una o más metas no existen o no pertenecen al usuario');
      }
    }

    // 2. Validar superposición de sesiones si es WORK y COMPLETED
    if (input.type === 'WORK' && input.status === 'COMPLETED') {
      const overlap = await this.sessionRepo.findOverlappingWorkSession(
        userId,
        startedAt,
        endedAt
      );

      if (overlap) {
        throw new AppError(
          409,
          'Conflicto de sesión: el horario se superpone con otra sesión registrada'
        );
      }
    }

    // 3. Crear la sesión y asociar metas en transacción
    return this.sessionRepo.createWithGoals(
      userId,
      {
        type: input.type as SessionType,
        status: input.status as SessionStatus,
        targetSeconds: input.targetSeconds,
        durationSeconds: input.durationSeconds,
        startedAt,
        endedAt,
      },
      goalIds
    );
  }

  async listSessions(userId: string, limit = 50) {
    return this.sessionRepo.findAllByUserId(userId, limit);
  }
}

export const sessionService = new SessionService();
