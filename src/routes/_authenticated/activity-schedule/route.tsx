import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/activity-schedule')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, [
      'super admin',
      'admin',
      'tổ trưởng ngoại quan',
      'tổ phó sản xuất',
      'tổ trưởng sản xuất'
    ]);
  }
});
