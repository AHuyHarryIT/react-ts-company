import { createFileRoute } from '@tanstack/react-router';

import SalaryList from '@pages/admin/salaries/SalaryList';

export const Route = createFileRoute('/_authenticated/admin/salaries/')({
  component: SalaryList
});
