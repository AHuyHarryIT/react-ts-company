import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/stamps/history')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/stamps/history"!</div>;
}
