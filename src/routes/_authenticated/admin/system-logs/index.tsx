import SystemLogsPage from '@pages/admin/system-logs';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin/system-logs/')({
  component: SystemLogsPage,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['super admin']);
  }
});
