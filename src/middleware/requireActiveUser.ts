import { NextFunction, Response } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../firebase';
import { AppUser, AuthedRequest } from '../types';

const unauthorizedMessage = 'You are not an authorized provider.';

export const requireActiveUser = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const firebaseUser = req.firebaseUser;
  if (!firebaseUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userRef = db.collection('users').doc(firebaseUser.uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      const now = Timestamp.now();
      const newUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.name || firebaseUser.email || 'New User',
        role: 'intern',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(newUser);
      return res.status(403).json({ message: unauthorizedMessage });
    }

    const appUser = snapshot.data() as AppUser | undefined;
    if (!appUser || appUser.status !== 'active') {
      return res.status(403).json({ message: unauthorizedMessage });
    }

    req.appUser = appUser;
    return next();
  } catch (error) {
    console.error('Error loading user from Firestore', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
