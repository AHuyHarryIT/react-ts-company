import AdminRequestFormPage from '@pages/admin/request-forms/AdminRequestFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/request-forms/')({
  component: AdminRequestFormPage
});
