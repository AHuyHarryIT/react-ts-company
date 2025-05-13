import { createFileRoute } from '@tanstack/react-router';

import { productUpdateFields } from '@/configs/productForm.config';
import ComponentCard from '@components/common/ComponentCard';
import { UpdateForm } from '@components/ui/CRUD/UpdateForm';
import { productUpdateSchema } from '@schemas/product/productSchema.schema';
import { productService } from '@services/ProductService';
import BackButton from '@components/common/BackButton';

export const Route = createFileRoute('/_authenticated/admin/products/edit/$id')(
  {
    component: RouteComponent,
    parseParams: (params) => ({ id: params.id })
  }
);

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <>
      <BackButton to="/admin/products" />
      <ComponentCard title="Cập nhật sản phẩm">
        <UpdateForm
          id={id}
          fields={productUpdateFields}
          schema={productUpdateSchema}
          service={productService}
        />
      </ComponentCard>
    </>
  );
}
