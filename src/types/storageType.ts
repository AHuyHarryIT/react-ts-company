import { EmployeeType } from './employeeType';
import { ProductType } from './productType';

export type StorageType = {
  id: string;
  product_id: ProductType['id'];
  employee_id: EmployeeType['id'];
  bin: number;
  lot: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product?: ProductType;
  employee?: EmployeeType;
};

export type LotModalData = {
  code: string;
  date: string;
  product: ProductType['code'];
  expected: number;
  startFrom: number;
  endAt: number;
  actual: number;
  missing: number;
  missingLots: string[];
  status: string;
};
