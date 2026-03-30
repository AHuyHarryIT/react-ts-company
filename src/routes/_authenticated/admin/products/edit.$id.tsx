import { createFileRoute } from '@tanstack/react-router';

import ProductEdit from '@pages/admin/products/ProductEdit';

export const Route = createFileRoute('/_authenticated/admin/products/edit/$id')(
  {
    component: ProductEdit,
    parseParams: (params) => ({ id: params.id })
  }
);
