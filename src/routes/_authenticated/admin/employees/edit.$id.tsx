import { createFileRoute } from '@tanstack/react-router';

import EmployeeEdit from '@pages/admin/employees/EmployeeEdit';

export const Route = createFileRoute(
  '/_authenticated/admin/employees/edit/$id'
)({
  component: EmployeeEdit,
  parseParams: (params) => ({ id: params.id })
});
