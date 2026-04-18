import { createLazyFileRoute } from '@tanstack/react-router';

import SalaryWebDetail from '@pages/admin/salary-web/SalaryWebDetail';

export const Route = createLazyFileRoute(
  '/_authenticated/admin/salary-web/$id'
)({
  component: SalaryWebDetail
});
