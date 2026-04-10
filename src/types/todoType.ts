import { EmployeeType } from './employeeType';
import { ProductType } from './productType';

export type TodosType = {
  id: string;
  product_id: ProductType['id'];
  employee_id: EmployeeType['id'];
  shift: string;
  date: Date;
  quantity: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  product: {
    id: ProductType['id'];
    name: ProductType['name'];
  };
};

export type TodoCreateType = {
  productId: ProductType['id'];
  shift: string;
};

export type TodoUpdateQuantityType = {
  productId: ProductType['id'];
  quantity: number;
  shift?: string;
};

export type TodoHistoryRequest = {
  productId?: ProductType['id'];
  month?: string;
};
