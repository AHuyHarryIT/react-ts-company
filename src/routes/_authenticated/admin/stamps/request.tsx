import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/request')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/admin/stamps/request"!</div>;
}
