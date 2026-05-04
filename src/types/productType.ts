import { z } from 'zod';

import {
  productCreateSchema,
  productSchema,
  productUpdateSchema
} from '@/schema/product/productSchema.schema';
import { ProductStatusType } from '@constants/productStatus.enum';
import { EmployeeType } from './employeeType';

export type ProductType = z.infer<typeof productSchema>;
export type ProductCreateType = z.infer<typeof productCreateSchema>;
export type ProductUpdateType = z.infer<typeof productUpdateSchema>;

export type ProductHistoryStatusType = {
  id: string;
  product_id: ProductType['id'];
  quantity: number;
  status: ProductStatusType;
  shift?: string | null;
  date: string;
  employee_id: EmployeeType['id'];
  created_at: string;
  updated_at: string;
  employee?: {
    id: EmployeeType['id'];
    name: EmployeeType['name'];
  };
};

export type ProductHistoryDetailType = {
  product: ProductType;
  status1: ProductHistoryStatusType[];
  status2: ProductHistoryStatusType[];
  status8?: ProductHistoryStatusType[];
  status6: ProductHistoryStatusType[];
};
