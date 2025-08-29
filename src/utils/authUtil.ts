import { User } from '@/types/authType';
import { redirect } from '@tanstack/react-router';

export const isAdmin = (role: string): boolean => {
  return ['admin', 'super admin', 'co admin'].includes(role.toLowerCase());
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

export function disableRole(user: User | null, disallowedRoles: string[]) {
  if (!user) {
    throw redirect({ to: '/login' });
  }

  if (
    disallowedRoles
      .map((role) => role.toLowerCase())
      .includes(user.role.name.toLowerCase())
  ) {
    throw redirect({ to: '/forbidden', statusCode: 403 });
  }
}

export const isAllowRole = (user: User | null, allowedRoles: string[]) => {
  if (!user) {
    return false;
  }

  return allowedRoles
    .map((role) => role.toLowerCase())
    .includes(user.role.name.toLowerCase());
};
