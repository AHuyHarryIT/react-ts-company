import { createFileRoute } from '@tanstack/react-router';

import WorkScheduleCategoryList from '@pages/admin/workScheduleCategories/WorkScheduleCategoryList';

export const Route = createFileRoute(
  '/_authenticated/admin/work-schedule-categories/'
)({
  component: WorkScheduleCategoryList
});
