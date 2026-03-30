import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/request-forms')({
  component: () => <Outlet />
});
