import { Router } from 'express';
import { statsController } from '../controllers/stats.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { dailyStatsQuerySchema } from '../schemas/stats.schema.js';

export const statsRoutes = Router();

statsRoutes.get('/daily', validateRequest(dailyStatsQuerySchema), statsController.getDaily);
statsRoutes.get('/summary', statsController.getSummary);
