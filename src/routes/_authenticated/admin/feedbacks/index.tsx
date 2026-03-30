import { createFileRoute } from '@tanstack/react-router';

import FeedbackPage from '@pages/admin/feedbacks/FeedbackPage';

type FeedbackSearch = {
  highlightId?: string;
};

export const Route = createFileRoute('/_authenticated/admin/feedbacks/')({
  component: FeedbackPage,
  validateSearch: (search: Record<string, unknown>): FeedbackSearch => ({
    highlightId: search.highlightId as string | undefined
  })
});
