import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/attendances/sheet')(
  {
    component: RouteComponent
  }
);

function RouteComponent() {
  return <div>Hello "/admin/attendances/sheet"!</div>;
}
