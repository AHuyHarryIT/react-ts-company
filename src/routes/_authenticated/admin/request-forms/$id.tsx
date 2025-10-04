import AdminRequestFormDetailPage from '@pages/admin/request-forms/AdminRequestFormDetailPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/request-forms/$id')(
  {
    component: AdminRequestFormDetailPage
  }
);
