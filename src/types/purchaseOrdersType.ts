import { ProductType } from './productType';
import { Shift } from './shift';

type ProductPo = {
  productId: ProductType['id'];
  quantity: number;
};

export type AddPoExportRequest = {
  date: string;
  products: ProductPo[];
};

export type AddPoRequest = {
  status: number;
  date: string;
  shift?: Shift;
  products: ProductPo[];
};
