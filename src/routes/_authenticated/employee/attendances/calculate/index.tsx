import { CalculateRecord } from '@pages/employee/attendance/CalculateRecord';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/attendances/calculate/'
)({
  component: CalculateRecord
});
