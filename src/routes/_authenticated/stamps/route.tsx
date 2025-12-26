import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/stamps')({
  component: () => <Outlet />,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, [
      'admin',
      'super admin',
      'qa-qc',
      'qc',
      'co admin',
      'co admin'
    ]);
  }
});
