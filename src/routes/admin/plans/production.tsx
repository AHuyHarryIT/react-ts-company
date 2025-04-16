import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/plans/production')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/plans/production"!</div>;
}
