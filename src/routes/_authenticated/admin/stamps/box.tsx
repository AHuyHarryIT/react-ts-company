import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/box')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/admin/stamps/box"!</div>;
}
