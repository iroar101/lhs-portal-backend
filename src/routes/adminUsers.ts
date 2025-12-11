import { Router, Response } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../firebase';
import { requireAuth } from '../middleware/auth';
import { requireActiveUser } from '../middleware/requireActiveUser';
import { requireRole } from '../middleware/requireRole';
import { AppUser, AuthedRequest, UserRole, UserStatus } from '../types';

const router = Router();

router.use(requireAuth, requireActiveUser, requireRole(['super_user', 'provider']));

const isValidRole = (role: unknown): role is UserRole =>
  role === 'super_user' || role === 'provider' || role === 'intern';

const isValidStatus = (status: unknown): status is UserStatus =>
  status === 'pending' || status === 'active' || status === 'disabled';

router.get('/', async (_req: AuthedRequest, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const users: AppUser[] = snapshot.docs.map(
      (doc) => doc.data() as AppUser
    );
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:uid', async (req: AuthedRequest, res: Response) => {
  const { uid } = req.params;
  const { role, status } = req.body as Partial<AppUser>;
  const actor = req.appUser;

  if (
    (role !== undefined && !isValidRole(role)) ||
    (status !== undefined && !isValidStatus(status))
  ) {
    return res.status(400).json({ error: 'Invalid role or status' });
  }

  if (role === undefined && status === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const updates: Partial<AppUser> = { updatedAt: Timestamp.now() };
  if (role !== undefined) {
    updates.role = role;
  }
  if (status !== undefined) {
    updates.status = status;
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const target = snapshot.data() as AppUser;
    if (actor?.role === 'provider') {
      if (target.role === 'super_user') {
        return res
          .status(403)
          .json({ error: 'Providers cannot modify super users' });
      }
      if (role === 'super_user') {
        return res
          .status(403)
          .json({ error: 'Providers cannot assign the super_user role' });
      }
    }

    await userRef.update(updates);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error updating user', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
