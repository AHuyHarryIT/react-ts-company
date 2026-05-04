import { Outlet, createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/activity-schedule')({
  component: () => <Outlet />,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, [
      'super admin',
      'admin',
      'tổ trưởng ngoại quan',
      'tổ phó sản xuất',
      'tổ trưởng sản xuất',
      'tổ trưởng qc',
      'tổ trưởng kho',
      'tổ trưởng khuôn',
      'co admin',
      23,
      24,
      25
    ]);
  }
});
