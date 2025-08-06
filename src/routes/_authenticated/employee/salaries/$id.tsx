import { SalaryDetail } from '@pages/employee/salary/SalaryDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/salaries/$id')({
  component: SalaryDetail
});
