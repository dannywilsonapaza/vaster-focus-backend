import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? null,
    });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    error: 'Error interno del servidor',
  });
};