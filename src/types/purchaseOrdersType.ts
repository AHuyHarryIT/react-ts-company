import { ProductType } from './productType';
import { Shift } from './shift';

export type AddPoRequest = {
  status: number;
  date: string;
  shift?: Shift;
  products: { productId: ProductType['id']; quantity: number }[];
};
