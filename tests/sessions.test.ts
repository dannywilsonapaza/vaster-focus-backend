import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Session Tracking API (/api/sessions)', () => {
  let goalId1: string;
  let goalId2: string;

  beforeAll(async () => {
    // Clean up test sessions
    await prisma.sessionGoal.deleteMany();
    await prisma.session.deleteMany();

    // Create test goals
    const g1 = await request(app).post('/api/goals').send({ title: 'Goal 1' });
    const g2 = await request(app).post('/api/goals').send({ title: 'Goal 2' });
    goalId1 = g1.body.id;
    goalId2 = g2.body.id;
  });

  it('POST /api/sessions - registra exitosamente una sesión de trabajo completada', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1500,
        durationSeconds: 1500,
        startedAt: '2026-09-12T10:00:00-05:00',
        endedAt: '2026-09-12T10:25:00-05:00',
        goalIds: [goalId1],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('WORK');
    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.durationSeconds).toBe(1500);
    expect(res.body.goals).toHaveLength(1);
    expect(res.body.goals[0].goalId).toBe(goalId1);
  });

  it('POST /api/sessions - rechaza si durationSeconds excede el intervalo entre endedAt y startedAt (400)', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1500,
        durationSeconds: 3000, // Excede los 1500s de diferencia
        startedAt: '2026-09-12T11:00:00-05:00',
        endedAt: '2026-09-12T11:25:00-05:00',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Error de validación');
  });

  it('POST /api/sessions - rechaza marcas de tiempo en el futuro (400)', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1500,
        durationSeconds: 1500,
        startedAt: '2099-01-01T10:00:00-05:00',
        endedAt: '2099-01-01T10:25:00-05:00',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Error de validación');
  });

  it('POST /api/sessions - rechaza sesiones que colisionan o se solapan en horario (409 Conflict)', async () => {
    // 1. Crear sesión de 14:00 a 14:30
    await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1800,
        durationSeconds: 1800,
        startedAt: '2026-09-12T14:00:00-05:00',
        endedAt: '2026-09-12T14:30:00-05:00',
      });

    // 2. Intentar crear sesión solapada de 14:15 a 14:45
    const overlapRes = await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1800,
        durationSeconds: 1800,
        startedAt: '2026-09-12T14:15:00-05:00',
        endedAt: '2026-09-12T14:45:00-05:00',
      });

    expect(overlapRes.status).toBe(409);
    expect(overlapRes.body.error).toContain('Conflicto de sesión');
  });

  it('POST /api/sessions - rechaza y aborta atómicamente si contiene un goalId inexistente (400)', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        type: 'WORK',
        status: 'COMPLETED',
        targetSeconds: 1500,
        durationSeconds: 1500,
        startedAt: '2026-09-12T16:00:00-05:00',
        endedAt: '2026-09-12T16:25:00-05:00',
        goalIds: ['id-de-meta-falsa-xyz'],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('no existen');
  });
});
