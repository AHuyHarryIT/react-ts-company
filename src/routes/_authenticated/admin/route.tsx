import { createFileRoute } from '@tanstack/react-router';
import { requirePermission, requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context.authenticated;
    requireRole(user, ['admin', 'super admin', 'co admin']);
    // Kiểm tra quyền theo URL cho các trang con (không check /admin root)
    const path = location.pathname.replace(/\/+$/, '');
    if (path !== '/admin' && path !== '') {
      requirePermission(user, location.pathname);
    }
  }
});
