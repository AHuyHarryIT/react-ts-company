import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAllowRole, requirePermission, requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context.authenticated;
    requireRole(user, ['admin', 'super admin', 'co admin', 'tổ trưởng qc', 23]);

    const path = location.pathname.replace(/\/+$/, '');
    if (
      path === '/admin' &&
      !isAllowRole(user, ['admin', 'super admin', 'co admin'])
    ) {
      requireRole(user, ['admin', 'super admin', 'co admin']);
    }

    if (path === '/admin') {
      throw redirect({
        to: isAllowRole(user, ['super admin']) ? '/admin/rbac' : '/',
        replace: true
      });
    }

    // Kiểm tra quyền theo URL cho các trang con (không check /admin root)
    if (path !== '/admin' && path !== '') {
      requirePermission(user, location.pathname);
    }
  }
});
