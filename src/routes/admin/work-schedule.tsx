import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/work-schedule')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/work-schedule"!</div>;
}
