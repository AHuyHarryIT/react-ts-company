import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/admin/salaries/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/salaries/$id"!</div>;
}
