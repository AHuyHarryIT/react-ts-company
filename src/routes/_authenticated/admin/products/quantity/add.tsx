import { createFileRoute } from '@tanstack/react-router';

import ProductQuantityAdd from '@pages/admin/products/ProductQuantityAdd';

export const Route = createFileRoute(
  '/_authenticated/admin/products/quantity/add'
)({
  component: ProductQuantityAdd
});
