import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/plans/material')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/plans/material"!</div>;
}
