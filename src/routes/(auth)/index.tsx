import { createFileRoute } from '@tanstack/react-router';

import Login from '@pages/auth/Login';
import { guestOnly } from '@utils/auth';

export const Route = createFileRoute('/(auth)/')({
  beforeLoad: guestOnly,
  component: RouteComponent,
  head: () => ({
    title: 'Login',
    meta: [
      {
        name: 'description',
        content: 'Login page for the application'
      }
    ]
  })
});

function RouteComponent() {
  return (
    <>
      <Login />
    </>
  );
}
