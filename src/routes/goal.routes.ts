import { Router } from 'express';
import { goalController } from '../controllers/goal.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createGoalSchema, updateGoalSchema } from '../schemas/goal.schema.js';

export const goalRoutes = Router();

goalRoutes.post('/', validateRequest(createGoalSchema), goalController.create);
goalRoutes.get('/', goalController.list);
goalRoutes.patch('/:id', validateRequest(updateGoalSchema), goalController.update);
