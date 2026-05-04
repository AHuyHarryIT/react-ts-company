import { createFileRoute } from '@tanstack/react-router';

import WorkScheduleManagementTabs from '@pages/admin/workSchedule/WorkScheduleManagementTabs';

export const Route = createFileRoute('/_authenticated/work-schedules/')({
  component: WorkScheduleManagementTabs
});
