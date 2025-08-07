import { HistoryRecord } from '@pages/employee/attendance/HistoryRecord';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/attendances/history/'
)({
  component: HistoryRecord
});
