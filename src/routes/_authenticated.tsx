import AppLayout from '@layouts/AppLayout';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const { isLogged } = context.authenticated;
    const isLoggedResult = await isLogged();

    if (!isLoggedResult) {
      throw redirect({
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
