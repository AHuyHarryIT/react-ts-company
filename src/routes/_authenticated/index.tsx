import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAdmin } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
    const admin = isAdmin(user?.role.name || '');
    if (admin) {
      throw redirect({ to: '/admin', replace: true });
    } else {
      throw redirect({ to: '/employee', replace: true });
    }
  }
});
