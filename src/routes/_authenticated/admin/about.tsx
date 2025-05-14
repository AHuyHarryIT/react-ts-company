import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/about')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/admin/about"!</div>;
}
