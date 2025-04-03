import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/salaries/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/salary"!</div>;
}
