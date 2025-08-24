import { EditLayout } from '@pages/admin/configLayout/EditLayout';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin/edit-layout/')({
  component: EditLayout,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['super admin']);
  }
});
