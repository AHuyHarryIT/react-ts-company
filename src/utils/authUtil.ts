import { User } from '@/types/authType';
import { redirect } from '@tanstack/react-router';

export const isAdmin = (role: string): boolean => {
  return role.toLowerCase() === 'admin' || role.toLowerCase() === 'super admin';
};

export function requireRole(user: User | null, allowedRoles: string[]) {
  if (!user) {
    throw redirect({ to: '/login' });
  }

  if (
    !allowedRoles
      .map((role) => role.toLowerCase())
      .includes(user.role.name.toLowerCase())
  ) {
    throw redirect({ to: '/forbidden', statusCode: 403 });
  }
}
