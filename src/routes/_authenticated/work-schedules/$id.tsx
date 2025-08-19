import { createFileRoute } from '@tanstack/react-router';

import Detail from '@pages/admin/workSchedule/Detail';

export const Route = createFileRoute('/_authenticated/work-schedules/$id')({
  component: Detail
});
