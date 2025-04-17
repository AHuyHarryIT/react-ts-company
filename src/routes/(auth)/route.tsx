import { createFileRoute, redirect } from '@tanstack/react-router';

import AuthLayout from '@layouts/AuthLayout';

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async ({ context }) => {
    const { isLogged, user } = context.authenticated;
    const role = user?.role.id;
    console.log('Auth route', role);
    if (await isLogged()) {
      // Redirect to admin if already authenticated
      switch (role) {
        case '15':
          throw redirect({ to: '/admin', replace: true });
        default:
          throw redirect({ to: '/', replace: true });
      }
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <AuthLayout />
    </>
  );
}
