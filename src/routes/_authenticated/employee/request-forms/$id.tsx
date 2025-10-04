import EmployeeRequestFormDetailPage from '@pages/employee/request-forms/EmployeeRequestFormDetailPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/request-forms/$id'
)({
  component: EmployeeRequestFormDetailPage
});
