import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/work-schedules/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/work-schedules/$id"!</div>;
}
