import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['admin', 'super admin']);
  }
});
