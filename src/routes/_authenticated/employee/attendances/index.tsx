import { AttendancePage } from '@pages/employee/attendance/AttendancePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/attendances/')({
  component: AttendancePage
});
