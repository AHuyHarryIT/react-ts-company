import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/attendances/history')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/attendances/history"!</div>;
}
