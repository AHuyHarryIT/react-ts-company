import SalariesList from '@pages/employee/salary/SalariesList';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/salaries/')({
  component: SalariesList
});
