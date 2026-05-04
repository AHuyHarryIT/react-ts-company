import { DailyQuantitiesType } from './dailyQuantitiesType';
import { ProductType } from './productType';
import { Shift } from './shift';

type ProductPo = {
  productId: ProductType['id'];
  quantity: number;
};

export type AddPoExportRequest = {
  date: string;
  fileName: string;
  note?: string | null;
  products: ProductPo[];
};

export type AddPoRequest = {
  status: number;
  date: string;
  shift?: Shift;
  products: ProductPo[];
};

export type UpdatePoRequest = {
  date: string;
  products: ProductPo[];
};

export type AddPoInventoryRequest = {
  month: string;
  products: ProductPo[];
};

export interface PurchaseOrdersHistoryResponse {
  dates: string[];
  dailyQuantitiesPo: DailyQuantitiesType[];
}
