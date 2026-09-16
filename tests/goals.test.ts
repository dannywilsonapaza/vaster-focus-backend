import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Goal Management API (/api/goals)', () => {
  beforeAll(async () => {
    // Ensure default user exists
    await prisma.user.upsert({
      where: { email: 'wilson@vasterfocus.com' },
      update: {},
      create: {
        email: 'wilson@vasterfocus.com',
        timezone: 'America/Lima',
      },
    });
  });

  it('POST /api/goals - crea exitosamente una nueva meta', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({ title: 'Aprender Rust y WebAssembly' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Aprender Rust y WebAssembly');
    expect(res.body.isCompleted).toBe(false);
  });

  it('POST /api/goals - rechaza peticiones con título vacío (400)', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Error de validación');
  });

  it('GET /api/goals - retorna la lista de metas del usuario', async () => {
    const res = await request(app).get('/api/goals');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('PATCH /api/goals/:id - actualiza el estado a completado y renombra la meta', async () => {
    // 1. Crear meta
    const createRes = await request(app)
      .post('/api/goals')
      .send({ title: 'Meta a actualizar' });
    const goalId = createRes.body.id;

    // 2. Actualizar estado
    const patchRes = await request(app)
      .patch(`/api/goals/${goalId}`)
      .send({ isCompleted: true, title: 'Meta completada y renombrada' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.isCompleted).toBe(true);
    expect(patchRes.body.title).toBe('Meta completada y renombrada');
  });

  it('PATCH /api/goals/:id - retorna 404 si la meta no existe', async () => {
    const res = await request(app)
      .patch('/api/goals/id-inexistente-123')
      .send({ isCompleted: true });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Meta no encontrada');
  });
});
