import { createFileRoute } from '@tanstack/react-router';

import EmployeeTrash from '@pages/admin/employees/EmployeeTrash';

export const Route = createFileRoute('/_authenticated/admin/employees/trash/')({
  component: EmployeeTrash
});
