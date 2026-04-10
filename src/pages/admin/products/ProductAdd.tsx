import { productCreateFields } from '@/configs/productForm.config';
import { CreateForm } from '@components/ui/CRUD/CreateForm';
import { productCreateSchema } from '@schemas/product/productSchema.schema';
import { productService } from '@services/ProductService';

export default function ProductAdd() {
  return (
    <CreateForm
      fields={productCreateFields}
      schema={productCreateSchema}
      service={productService}
    />
  );
}
