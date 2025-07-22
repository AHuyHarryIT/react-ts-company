import { authLogout } from '@services/AuthService';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    switch (user?.role.name.toLowerCase()) {
      case 'admin':
      case 'super admin':
        throw redirect({ to: '/admin', replace: true });
      default:
        await authLogout();
        throw redirect({ to: '/login', replace: true });
    }
  }
});
