import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  req.userId = req.session.userId;
  next();
}

