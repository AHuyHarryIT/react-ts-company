import { createFileRoute } from '@tanstack/react-router';

import AttendancesPage from '@pages/admin/attendances/AttendancesPage';

export const Route = createFileRoute('/_authenticated/admin/attendances/')({
  component: AttendancesPage
});
