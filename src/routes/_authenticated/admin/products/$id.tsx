import { ProductDetail } from '@pages/admin/products/ProductDetail';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/_authenticated/admin/products/$id');

const ProductDetailRoute = () => {
  const { id } = routeApi.useParams();
  return <ProductDetail id={id} />;
};

export const Route = createFileRoute('/_authenticated/admin/products/$id')({
  component: ProductDetailRoute
});
