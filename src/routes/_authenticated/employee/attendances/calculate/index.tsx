import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/attendances/calculate/'
)({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_authenticated/employee/attendances/calculate/"!</div>;
}
