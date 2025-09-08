import { createFileRoute } from '@tanstack/react-router';
import HistoryPage from '@pages/admin/history';

export const Route = createFileRoute('/_authenticated/admin/history/')({
  component: HistoryPage
});
