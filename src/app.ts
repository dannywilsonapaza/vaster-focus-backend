import express from 'express';
import cors from 'cors';
import { userContext } from './middlewares/userContext.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './errors/AppError.js';
import { goalRoutes } from './routes/goal.routes.js';
import { sessionRoutes } from './routes/session.routes.js';
import { statsRoutes } from './routes/stats.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// User Context Middleware (single-user MVP)
app.use(userContext);

// API Routes
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((_req, _res, next) => {
  next(new AppError(404, 'Ruta no encontrada'));
});

// Centralized error handler
app.use(errorHandler);
