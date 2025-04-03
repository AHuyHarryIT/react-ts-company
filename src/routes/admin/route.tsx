import { createFileRoute } from '@tanstack/react-router';

import AppLayout from '@layouts/AppLayout';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppLayout />
    </>
  );
}
