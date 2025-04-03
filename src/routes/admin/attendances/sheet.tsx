import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/attendances/sheet')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/attendances/sheet"!</div>;
}
