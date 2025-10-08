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

export function requireAdminOrSupervisor(
  user: User | null,
  supervisorIds: string[]
) {
  if (!user) {
    throw redirect({ to: '/login' });
  }

  // Cho phép admin roles
  const adminRoles = ['admin', 'super admin', 'co admin'];
  const isAdminRole = adminRoles
    .map((role) => role.toLowerCase())
    .includes(user.role.name.toLowerCase());

  // Cho phép các supervisor có user ID đặc biệt
  // Normalize cả user.id và supervisorIds để so sánh (bỏ qua leading zeros và convert về string)
  const normalizedUserId = user.id.toString().replace(/^0+/, '');
  const normalizedSupervisorIds = supervisorIds.map((id) =>
    id.toString().replace(/^0+/, '')
  );
  const isSupervisor =
    normalizedSupervisorIds.includes(normalizedUserId) ||
    supervisorIds.includes(user.id);

  if (!isAdminRole && !isSupervisor) {
    throw redirect({ to: '/forbidden', statusCode: 403 });
  }
}

export function getUserApprovalType(
  user: User | null,
  supervisorIds: string[] = []
): 'admin' | 'supervisor' | null {
  if (!user) return null;

  // Check if user is admin
  const adminRoles = ['admin', 'super admin', 'co admin'];
  const isAdminRole = adminRoles
    .map((role) => role.toLowerCase())
    .includes(user.role.name.toLowerCase());

  if (isAdminRole) return 'admin';

  // Check if user is supervisor (có user ID đặc biệt)
  // Normalize để so sánh (bỏ qua leading zeros)
  const normalizedUserId = user.id.toString().replace(/^0+/, '');
  const normalizedSupervisorIds = supervisorIds.map((id) =>
    id.toString().replace(/^0+/, '')
  );
  const isSupervisor =
    normalizedSupervisorIds.includes(normalizedUserId) ||
    supervisorIds.includes(user.id);

  if (isSupervisor) return 'supervisor';

  return null;
}
