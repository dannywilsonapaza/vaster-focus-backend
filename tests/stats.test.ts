import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { calculateStreaks, shiftDayString, getLimaDateString } from '../src/services/stats.service.js';

describe('Timezone Metrics & Stats API (/api/stats)', () => {
  let defaultUserId: string;

  beforeAll(async () => {
    // Ensure default user exists
    const user = await prisma.user.upsert({
      where: { email: 'wilson@vasterfocus.com' },
      update: {},
      create: {
        email: 'wilson@vasterfocus.com',
        timezone: 'America/Lima',
      },
    });
    defaultUserId = user.id;

    // Clean up test sessions
    await prisma.sessionGoal.deleteMany();
    await prisma.session.deleteMany();
  });

  describe('Cálculo de Rachas (Algoritmo con Ventana de Gracia)', () => {
    const referenceDate = new Date('2026-09-15T15:00:00-05:00'); // Martes 15 de Septiembre
    const todayStr = getLimaDateString(referenceDate); // '2026-09-15'
    const yesterdayStr = shiftDayString(todayStr, -1); // '2026-09-14'
    const twoDaysAgoStr = shiftDayString(todayStr, -2); // '2026-09-13'
    const threeDaysAgoStr = shiftDayString(todayStr, -3); // '2026-09-12'

    it('Racha en ventana de gracia: estudió ayer y anteayer, hoy aún no', () => {
      const studyDays = [threeDaysAgoStr, twoDaysAgoStr, yesterdayStr]; // 3 días consecutivos
      const result = calculateStreaks(studyDays, referenceDate);

      expect(result.studiedToday).toBe(false);
      expect(result.currentStreak).toBe(3);
      expect(result.bestStreak).toBe(3);
    });

    it('Racha incrementada: estudió ayer y hoy', () => {
      const studyDays = [twoDaysAgoStr, yesterdayStr, todayStr];
      const result = calculateStreaks(studyDays, referenceDate);

      expect(result.studiedToday).toBe(true);
      expect(result.currentStreak).toBe(3);
      expect(result.bestStreak).toBe(3);
    });

    it('Racha rota: no estudió ayer', () => {
      const studyDays = [threeDaysAgoStr, twoDaysAgoStr]; // Se saltó ayer (14)
      const result = calculateStreaks(studyDays, referenceDate);

      expect(result.studiedToday).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(2);
    });

    it('Sin historial: 0 días', () => {
      const result = calculateStreaks([], referenceDate);

      expect(result.studiedToday).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
    });
  });

  describe('Proyección Horaria Nativa SQL en America/Lima', () => {
    it('Agrupa correctamente una sesión nocturna (23:30 Lima = 04:30 UTC del día siguiente) en el día local', async () => {
      // 23:30 hora de Lima del 2026-09-10 corresponde a 2026-09-11T04:30:00Z en UTC
      await prisma.session.create({
        data: {
          userId: defaultUserId,
          type: 'WORK',
          status: 'COMPLETED',
          targetSeconds: 1500,
          durationSeconds: 1500,
          startedAt: new Date('2026-09-11T04:30:00.000Z'), // 23:30 Lima del 10
          endedAt: new Date('2026-09-11T04:55:00.000Z'),   // 23:55 Lima del 10
        },
      });

      // Crear un descanso en el mismo día
      await prisma.session.create({
        data: {
          userId: defaultUserId,
          type: 'SHORT_BREAK',
          status: 'COMPLETED',
          targetSeconds: 300,
          durationSeconds: 300,
          startedAt: new Date('2026-09-11T04:55:00.000Z'),
          endedAt: new Date('2026-09-11T05:00:00.000Z'),
        },
      });

      const res = await request(app).get('/api/stats/daily');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const day10 = res.body.find((d: any) => d.studyDay === '2026-09-10');
      expect(day10).toBeDefined();
      expect(day10.totalSeconds).toBe(1500);
      expect(day10.breakSeconds).toBe(300);
      expect(day10.sessionCount).toBe(1);
    });

    it('GET /api/stats/summary - retorna el resumen global con racha y totales', async () => {
      const res = await request(app).get('/api/stats/summary');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalWorkSeconds');
      expect(res.body).toHaveProperty('totalBreakSeconds');
      expect(res.body).toHaveProperty('totalSessions');
      expect(res.body).toHaveProperty('currentStreak');
      expect(res.body).toHaveProperty('bestStreak');
      expect(res.body).toHaveProperty('studiedToday');
      expect(typeof res.body.studiedToday).toBe('boolean');
    });
  });
});
