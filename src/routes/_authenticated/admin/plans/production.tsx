import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/plans/production')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/admin/plans/production"!</div>;
}
