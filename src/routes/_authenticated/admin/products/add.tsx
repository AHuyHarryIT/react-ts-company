import { createFileRoute } from '@tanstack/react-router';

import { productCreateFields } from '@/configs/productForm.config';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { CreateForm } from '@components/ui/CRUD/CreateForm';
import { productCreateSchema } from '@schemas/product/productSchema.schema';
import { productService } from '@services/ProductService';

export const Route = createFileRoute('/_authenticated/admin/products/add')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <BackButton />
      <ComponentCard title="Thêm sản phẩm">
        <CreateForm
          fields={productCreateFields}
          schema={productCreateSchema}
          service={productService}
        />
      </ComponentCard>
    </>
  );
}
