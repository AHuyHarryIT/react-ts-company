import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/check-po')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/check-po"!</div>;
}
