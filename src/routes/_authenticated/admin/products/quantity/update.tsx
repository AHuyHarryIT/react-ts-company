import { createFileRoute } from '@tanstack/react-router';

import axiosPrivate from '@/api/axiosInstance';
import ProductQuantityUpdate from '@pages/admin/products/ProductQuantityUpdate';

export const Route = createFileRoute(
  '/_authenticated/admin/products/quantity/update'
)({
  component: ProductQuantityUpdate,
  loader: async () => {
    const response: { months: string[] } = await axiosPrivate.get(
      '/api/products/month-list'
    );
    const months = response.months || [];
    return { months };
  }
});
