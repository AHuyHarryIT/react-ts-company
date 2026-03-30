import { createFileRoute } from '@tanstack/react-router';

import EmployeeAdd from '@pages/admin/employees/EmployeeAdd';

export const Route = createFileRoute('/_authenticated/admin/employees/add')({
  component: EmployeeAdd
});
