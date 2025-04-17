import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context, location }) => {
    const { isLogged, user } = context.authenticated;
    const role = user?.role.id;
    if (!isLogged() || role !== '15') {
      throw redirect({
        to: '/login',
        search: { redirect: role !== '15' && location.pathname }
      });
    }
  }
});
