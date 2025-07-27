import DailySchedule from '@pages/admin/dailySchedule/DailySchedule';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/activity-schedule')(
  {
    component: DailySchedule
  }
);
