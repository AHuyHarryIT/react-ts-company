import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/activity-schedule/'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>Hello "/_authenticated/employee/employee/activity-schedule/"!</div>
  );
}
