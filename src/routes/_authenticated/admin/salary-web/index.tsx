import { createFileRoute } from '@tanstack/react-router';

import SalaryWebList from '@pages/admin/salary-web/SalaryWebList';

export const Route = createFileRoute('/_authenticated/admin/salary-web/')({
  component: SalaryWebList
});
