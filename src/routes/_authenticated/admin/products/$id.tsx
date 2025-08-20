import { ProductDetail } from '@pages/admin/products/ProductDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/products/$id')({
  component: ProductDetail
});
