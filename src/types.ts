import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'super_user' | 'provider' | 'intern';
export type UserStatus = 'pending' | 'active' | 'disabled';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuthedRequest extends Request {
  firebaseUser?: DecodedIdToken;
  appUser?: AppUser;
}
