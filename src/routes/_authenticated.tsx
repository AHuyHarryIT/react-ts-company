import AppLayout from '@layouts/AppLayout';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context.authenticated;
    if (!user) {
      throw redirect({
        // TODO: change this to a login page
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <AppLayout />
    </>
  );
}
