import { createFileRoute, redirect } from '@tanstack/react-router';

import AuthLayout from '@layouts/AuthLayout';

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async ({ context }) => {
    const { isLogged, user } = context.authenticated;
    const isLoggedResult = await isLogged();

    if (isLoggedResult && user) {
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
