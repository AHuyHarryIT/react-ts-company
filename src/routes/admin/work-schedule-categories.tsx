import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/work-schedule-categories')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/work-schedule-categories"!</div>;
}
