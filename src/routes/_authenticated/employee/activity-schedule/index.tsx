import { ListActivity } from '@pages/employee/daily-activity/ListActivitySchedule';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/activity-schedule/'
)({
  component: ListActivity
});
