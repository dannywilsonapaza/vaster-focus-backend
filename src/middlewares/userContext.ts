import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export interface RequestUser {
  id: string;
  email: string;
  timezone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

let cachedUser: RequestUser | null = null;

export const userContext = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!cachedUser) {
      const email = process.env.DEFAULT_USER_EMAIL || 'wilson@vasterfocus.com';
      const timezone = process.env.DEFAULT_TIMEZONE || 'America/Lima';
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, timezone },
      });
      cachedUser = { id: user.id, email: user.email, timezone: user.timezone };
    }
    req.user = cachedUser;
    next();
  } catch (error) {
    next(error);
  }
};