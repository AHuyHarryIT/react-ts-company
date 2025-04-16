import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/activity-schedule')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/activity-schedule"!</div>;
}
