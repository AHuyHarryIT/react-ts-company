import { createFileRoute } from '@tanstack/react-router';

import ProductTrash from '@pages/admin/products/ProductTrash';

export const Route = createFileRoute('/_authenticated/admin/products/trash')({
  component: ProductTrash
});
