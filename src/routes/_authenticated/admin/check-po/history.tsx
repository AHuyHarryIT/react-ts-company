import { PoHistory } from '@pages/check-po/PoHistory';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/check-po/history')({
  component: PoHistory
});
