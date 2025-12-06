import { Router, Response } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAuth } from '../middleware/auth';
import { db } from '../firebase';
import { AppUser, AuthedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res: Response) => {
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
      return res.status(403).json({
        status: 'pending',
        message: 'You are not an authorized provider.',
      });
    }

    const appUser = snapshot.data() as AppUser | undefined;
    if (!appUser) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (appUser.status !== 'active') {
      return res.status(403).json({
        status: appUser.status,
        message: 'You are not an authorized provider.',
      });
    }

    return res.json({
      uid: appUser.uid,
      email: appUser.email,
      displayName: appUser.displayName,
      role: appUser.role,
      status: appUser.status,
    });
  } catch (error) {
    console.error('Error fetching current user', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
