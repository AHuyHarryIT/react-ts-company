import RequestFormList from '@/pages/admin/request-forms';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/request-forms/')({
  component: RequestFormList
});
