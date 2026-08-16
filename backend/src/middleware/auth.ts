import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dms_jwt_secret_2024_bangladesh';

export interface AuthPayload {
  user_id: string;
  email: string;
  role: 'admin' | 'victim';
  name: string;
  victim_id?: string;
}

// Extend Express Request to carry auth user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  return req.cookies?.dms_token ||
    req.headers.authorization?.replace('Bearer ', '') ||
    null;
}

// ─── requireAdmin — protects admin-only routes ───
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

// ─── requireVictim — protects victim-only routes ───
export function requireVictim(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (decoded.role !== 'victim') {
      return res.status(403).json({ error: 'Victim access required.' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

// ─── requireAnyAuth — protects authenticated routes (admin OR victim) ───
export function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

// ─── optionalAuth — attaches user if token present, does not block ───
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      // ignore invalid token in optional mode
    }
  }
  next();
}
