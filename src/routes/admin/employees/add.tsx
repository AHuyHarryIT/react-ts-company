import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/employees/add')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/employees/add"!</div>;
}
