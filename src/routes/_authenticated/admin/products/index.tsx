import { createFileRoute } from '@tanstack/react-router';

import ProductList from '@pages/admin/products/ProductList';

export const Route = createFileRoute('/_authenticated/admin/products/')({
  component: ProductList
});
