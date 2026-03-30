import { createFileRoute } from '@tanstack/react-router';

import WorkScheduleList from '@pages/admin/workSchedule/WorkScheduleList';

export const Route = createFileRoute('/_authenticated/work-schedules/')({
  component: WorkScheduleList
});
