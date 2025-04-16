import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/stamps/request')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/stamps/request"!</div>;
}
