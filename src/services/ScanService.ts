import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';
import { ProductType } from '@/types/productType';
import { LotModalData, StorageType } from '@/types/storageType';

const EMP_ENDPOINT = '/api/scan';

export type StorageParams = {
  filter_date?: Date;
  filter_month?: string;
  product_id?: ProductType['id'];
  employee_id?: EmployeeType['id'];
  lot?: string;
  lot_product_id?: ProductType['id'];
};

export type StorageResponse = {
  storage: { [key: string]: StorageType[] };
  products: ProductType[];
  employees: EmployeeType[];
  availableMonths: string[];
  availableDates: Date[];
  filterMonth: string;
  filterDate: Date;
  lotModalData: LotModalData | null;
};

export const checkBarcode = async (barcode: string) => {
  const response = await axiosPrivate.post(`${EMP_ENDPOINT}/check`, {
    barcode: barcode
  });

  return response;
};

export const fetchStorage = async (params: StorageParams) => {
  const response = await axiosPrivate.get<StorageResponse, StorageResponse>(
    `${EMP_ENDPOINT}/storage`,
    {
      params: params
    }
  );
  return response;
};
