import { createFileRoute } from '@tanstack/react-router';

import Dashboard from '@pages/dashboards/Dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard
});
