import HistoryPrintStamp from '@pages/admin/stamps/HistoryPrintStamp';
import { createFileRoute } from '@tanstack/react-router';

type SearchParams = {
  highlightId?: string;
};

export const Route = createFileRoute('/_authenticated/stamps/history')({
  component: HistoryPrintStamp,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      highlightId: search.highlightId as string
    };
  }
});
