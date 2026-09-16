import { z } from 'zod';

export const dailyStatsQuerySchema = {
  query: z.object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'El parámetro from debe tener formato YYYY-MM-DD')
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'El parámetro to debe tener formato YYYY-MM-DD')
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .positive('limit debe ser un entero positivo')
      .max(365, 'limit no puede exceder 365 días')
      .default(30),
  }),
};

export type DailyStatsQueryInput = z.infer<typeof dailyStatsQuerySchema.query>;
