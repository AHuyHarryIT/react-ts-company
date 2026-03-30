import RequestFormDetail from '@pages/admin/request-forms/detail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/request-forms/$id')(
  {
    component: RequestFormDetail
  }
);
