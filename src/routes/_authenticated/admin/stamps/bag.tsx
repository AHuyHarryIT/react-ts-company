import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/bag')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/admin/stamps/bag"!</div>;
}
