import RegistryPage from '@pages/admin/registry/RegistryPage';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/admin/registry/')({
  component: RegistryPage,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['super admin']);
  }
});
