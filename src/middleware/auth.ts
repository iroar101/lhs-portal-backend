import { NextFunction, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { AuthedRequest } from '../types';

export const requireAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.firebaseUser = decodedToken;
    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
