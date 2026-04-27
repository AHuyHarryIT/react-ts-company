import { createFileRoute, redirect } from '@tanstack/react-router';
import { disableRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/employee')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context.authenticated;
    disableRole(user, ['admin', 'super admin', 'co admin']);

    const path = location.pathname.replace(/\/+$/, '');
    if (path === '/employee') {
      throw redirect({ to: '/employee/schedules', replace: true });
    }
  }
});
