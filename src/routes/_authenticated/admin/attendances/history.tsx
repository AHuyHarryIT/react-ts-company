import { History } from '@pages/admin/attendances/History';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/admin/attendances/history'
)({
  component: History
});
