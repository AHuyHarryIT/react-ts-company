import { Storage } from '@pages/employee/scan/Storage';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/scan/storage')({
  component: Storage,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['kho', 'super admin', 'admin']);
  }
});
