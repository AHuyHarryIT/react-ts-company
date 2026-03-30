import { createFileRoute } from '@tanstack/react-router';

import ProductAdd from '@pages/admin/products/ProductAdd';

export const Route = createFileRoute('/_authenticated/admin/products/add')({
  component: ProductAdd
});
