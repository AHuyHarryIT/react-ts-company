import {
  ProductCreateType,
  ProductType,
  ProductUpdateType
} from '@/types/productType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/products';

export const productService = new CrudService<
  ProductType,
  ProductCreateType,
  ProductUpdateType
>(ENDPOINT);
