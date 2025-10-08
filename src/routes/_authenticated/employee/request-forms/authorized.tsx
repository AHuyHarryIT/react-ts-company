import { createFileRoute } from '@tanstack/react-router';
import RequestFormTabs from '@pages/employee/request-forms/RequestFormTabs';

export const Route = createFileRoute(
  '/_authenticated/employee/request-forms/authorized'
)({
  component: RequestFormTabs
});
