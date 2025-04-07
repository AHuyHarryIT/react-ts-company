import { createFileRoute } from '@tanstack/react-router';

import AppLayout from '@layouts/AppLayout';
import { authGuard } from '@utils/auth';

export const Route = createFileRoute('/admin')({
  beforeLoad: authGuard,
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <AppLayout />
    </>
  );
}
