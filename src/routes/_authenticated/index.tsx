import { createFileRoute, redirect } from '@tanstack/react-router';

import Dashboard from '@pages/dashboards/Dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
  }
});
