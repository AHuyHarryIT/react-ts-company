import { createFileRoute, redirect } from '@tanstack/react-router';

import Login from '@pages/auth/Login';
import { authCheck } from '@services/AuthService';

export const Route = createFileRoute('/(auth)/')({
  beforeLoad: async ({ context }) => {
    if (context.authenticated) {
      try {
        await authCheck();
        return redirect({ to: '/admin' });
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }
  },
  component: RouteComponent,
  head: () => ({
    title: 'Login',
    meta: [
      {
        name: 'description',
        content: 'Login page for the application',
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <>
      <Login />
    </>
  );
}
