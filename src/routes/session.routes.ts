import { Router } from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createSessionSchema } from '../schemas/session.schema.js';

export const sessionRoutes = Router();

sessionRoutes.post('/', validateRequest(createSessionSchema), sessionController.create);
sessionRoutes.get('/', sessionController.list);
