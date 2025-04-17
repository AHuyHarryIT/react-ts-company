import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context, location }) => {
    const { isLogged } = context.authenticated;
    const user = context.user;
    if (!isLogged() || user?.role.id !== '15') {
      throw redirect({
        to: '/login',
        search: { redirect: user?.role.id !== '15' && location.pathname }
      });
    }
  }
});
