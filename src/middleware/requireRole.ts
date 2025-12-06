import { NextFunction, Response } from 'express';
import { AuthedRequest, UserRole } from '../types';

export const requireRole =
  (allowedRoles: UserRole[]) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    const appUser = req.appUser;

    if (!appUser || !allowedRoles.includes(appUser.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
