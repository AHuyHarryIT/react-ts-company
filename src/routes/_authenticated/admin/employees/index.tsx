import { createFileRoute } from '@tanstack/react-router';

import EmployeeList from '@pages/admin/employees/EmployeeList';

export const Route = createFileRoute('/_authenticated/admin/employees/')({
  component: EmployeeList
});
