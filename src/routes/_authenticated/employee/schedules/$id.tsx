import { ScheduleDetail } from '@pages/employee/schedule/ScheduleDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/schedules/$id')({
  component: ScheduleDetail
});
