import { Outlet, createFileRoute } from '@tanstack/react-router';
import { canViewTotalWorkSchedules, requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/work-schedules')({
  component: () => <Outlet />,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    if (canViewTotalWorkSchedules(user)) return;

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
