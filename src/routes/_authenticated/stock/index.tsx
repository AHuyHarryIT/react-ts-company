import { createFileRoute } from '@tanstack/react-router';

import StockTransactionPage from '@/pages/stock/StockTransactionPage';

export const Route = createFileRoute('/_authenticated/stock/')({
  component: StockTransactionPage
});
