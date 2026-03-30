import RBACPage from '@pages/admin/rbac/RBACPage';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin/rbac/')({
  component: RBACPage,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['super admin']);
  }
});
