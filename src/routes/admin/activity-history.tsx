import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/activity-history')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/activity-history"!</div>;
}
