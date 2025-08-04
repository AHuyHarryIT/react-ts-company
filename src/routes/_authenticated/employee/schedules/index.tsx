import { ScheduleList } from '@pages/employee/schedule/ScheduleList';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/schedules/')({
  component: ScheduleList
});
