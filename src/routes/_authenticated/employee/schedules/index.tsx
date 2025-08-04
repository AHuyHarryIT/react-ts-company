import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/schedules/')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_authenticated/employee/schedule/"!</div>;
}
