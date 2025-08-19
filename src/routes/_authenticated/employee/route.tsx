import { createFileRoute } from '@tanstack/react-router';
import { disableRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/employee')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    disableRole(user, ['admin', 'super admin']);
  }
});
