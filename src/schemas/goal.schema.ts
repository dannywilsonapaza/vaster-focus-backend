import { z } from 'zod';

export const createGoalSchema = {
  body: z.object({
    title: z
      .string({ message: 'El título es obligatorio' })
      .trim()
      .min(1, 'El título no puede estar vacío')
      .max(255, 'El título no puede exceder 255 caracteres'),
  }),
};

export const updateGoalSchema = {
  params: z.object({
    id: z.string().min(1, 'ID de meta inválido'),
  }),
  body: z
    .object({
      title: z.string().trim().min(1, 'El título no puede estar vacío').max(255, 'El título no puede exceder 255 caracteres').optional(),
      isCompleted: z.boolean().optional(),
    })
    .refine((data) => data.title !== undefined || data.isCompleted !== undefined, {
      message: 'Debe proporcionar al menos un campo a actualizar (title o isCompleted)',
    }),
};

export const goalIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'ID de meta inválido'),
  }),
};

export type CreateGoalInput = z.infer<typeof createGoalSchema.body>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema.body>;
