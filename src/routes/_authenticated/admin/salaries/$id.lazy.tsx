import { createLazyFileRoute } from '@tanstack/react-router';

import SalaryDetail from '@pages/admin/salaries/SalaryDetail';

export const Route = createLazyFileRoute('/_authenticated/admin/salaries/$id')({
  component: SalaryDetail
});
