import { z } from 'zod';

export const createSessionSchema = {
  body: z
    .object({
      type: z.enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK']).default('WORK'),
      status: z.enum(['COMPLETED', 'ABANDONED', 'CANCELLED']).default('COMPLETED'),
      targetSeconds: z.number().int().positive('targetSeconds debe ser un número entero positivo'),
      durationSeconds: z.number().int().nonnegative('durationSeconds no puede ser negativo'),
      startedAt: z.string().datetime({ offset: true, message: 'startedAt debe ser una fecha ISO-8601 con zona horaria' }),
      endedAt: z.string().datetime({ offset: true, message: 'endedAt debe ser una fecha ISO-8601 con zona horaria' }),
      goalIds: z.array(z.string()).optional().default([]),
    })
    .refine(
      (data) => new Date(data.endedAt).getTime() > new Date(data.startedAt).getTime(),
      {
        message: 'endedAt debe ser posterior a startedAt',
        path: ['endedAt'],
      }
    )
    .refine(
      (data) => {
        const diffSeconds = Math.ceil((new Date(data.endedAt).getTime() - new Date(data.startedAt).getTime()) / 1000);
        return data.durationSeconds <= diffSeconds;
      },
      {
        message: 'durationSeconds no puede exceder el intervalo entre endedAt y startedAt',
        path: ['durationSeconds'],
      }
    )
    .refine(
      (data) => {
        const maxFutureTime = Date.now() + 60000; // 1 minuto de tolerancia para drift
        return new Date(data.endedAt).getTime() <= maxFutureTime;
      },
      {
        message: 'Las marcas de tiempo no pueden estar en el futuro',
        path: ['endedAt'],
      }
    ),
};

export type CreateSessionInput = z.infer<typeof createSessionSchema.body>;
