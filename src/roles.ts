import { UserRole } from './types';

export interface RolePermissions {
  manageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_user: { manageUsers: true },
  provider: { manageUsers: true },
  intern: { manageUsers: false },
};
