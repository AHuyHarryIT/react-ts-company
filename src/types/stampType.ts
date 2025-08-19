import { EmployeeType } from './employeeType';
import { ProductType } from './productType';

export type HistoryPrintStampType = {
  id: string;
  employee_id: EmployeeType['id'];
  product_id: ProductType['id'];
  binCount: number;
  binStart: number;
  shift: number;
  date: Date;
  type: 'box' | 'bag' | string;
  status?: 'pending' | 'approve' | 'rejected' | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  product?: ProductType;
  employee?: EmployeeType;
  manager?: EmployeeType;
};
