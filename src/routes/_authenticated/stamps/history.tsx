import HistoryPrintStamp from '@pages/admin/stamps/HistoryPrintStamp';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/stamps/history')({
  component: HistoryPrintStamp
});
