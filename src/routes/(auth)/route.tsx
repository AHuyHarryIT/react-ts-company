import { createFileRoute, redirect } from '@tanstack/react-router';

import AuthLayout from '@layouts/AuthLayout';

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async ({ context }) => {
    const { isLogged } = context.authenticated;
    if (await isLogged()) {
      // Redirect to admin if already authenticated
      throw redirect({ to: '/', replace: true });
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
