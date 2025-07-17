import { createFileRoute } from '@tanstack/react-router';

import Records from '@pages/admin/attendances/Records';

export const Route = createFileRoute(
  '/_authenticated/admin/attendances/record'
)({
  component: Records
});
