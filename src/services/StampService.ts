import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';
import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { Shift } from '@/types/shift';

const ENDPOINT = '/api/stamps';
const EMP_ENDPOINT = '/api/employee/stamps';

interface DuplicateCheckResponse {
  isDuplicate: boolean;
  duplicates?: Array<{
    id: string;
    binStart: string;
    binCount: number;
    overlappingStamps: number[];
  }>;
  message?: string;
}

interface StampLogRequest {
  productId: string;
  date: string;
  shift: Shift;
  binCount: number;
  binStart: string;
  type: 'box' | 'bag' | string;
  purpose?: string;
  employee_id?: EmployeeType['id'];
  stamp_id?: string;
}

export interface RequestStampType {
  productId: string;
  date: string;
  shift: Shift;
  binCount: number;
  binStart: string;
  type: 'box' | 'bag' | string;
  purpose?: string;
}

export interface HistoryPrintStampType {
  id: string;
  product_id: string;
  employee_id: string;
  manager_id: string;
  date: string;
  shift: Shift;
  binCount: number;
  binStart: string;
  type: string;
  purpose?: string;
  status: string;
  manager_time: string;
  created_at: string;
  employee: EmployeeType;
  manager: EmployeeType;
  product: ProductType;
}

export const saveStamp = (request: StampLogRequest) => {
  const response = axiosPrivate.put(ENDPOINT + '/savePrint', request);
  return response;
};

export const getStampHistory = async (params: QueryParams) => {
  const response = await axiosPrivate.get<
    HistoryPrintStampType,
    PaginatedResponse<HistoryPrintStampType>
  >(ENDPOINT + '/history', {
    params: params
  });
  return response;
};

export const rejectStamp = async (id: string) => {
  const response = await axiosPrivate.post(`${ENDPOINT}/reject/${id}`);
  return response;
};

export const empStampRequest = async (data: { stamps: RequestStampType[] }) => {
  const response = await axiosPrivate.post(EMP_ENDPOINT + '/request', data);
  return response;
};

export const fetchEmpStampHistory = async (params: QueryParams) => {
  const response = await axiosPrivate.get<
    HistoryPrintStampType,
    PaginatedResponse<HistoryPrintStampType>
  >(EMP_ENDPOINT + '/history', {
    params: params
  });
  return response;
};

export const checkDuplicateStamps = async (params: {
  product_id: string;
  date: string;
  shift: Shift;
  binStart: string;
  binCount: number;
  type: string;
  record?: HistoryPrintStampType;
}): Promise<DuplicateCheckResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { record, ...apiParams } = params;

  try {
    // axiosPrivate interceptor already unwraps response.data
    const data = (await axiosPrivate.post(
      `${ENDPOINT}/check-duplicate`,
      apiParams
    )) as DuplicateCheckResponse;

    return data;
  } catch (error) {
    // Rethrow so the mutation's onError handler can decide what to do
    console.error('checkDuplicateStamps API error:', error);
    throw error;
  }
};

export const checkDuplicateStampsForEmployee = async (params: {
  product_id: string;
  date: string;
  shift: Shift;
  binStart: string;
  binCount: number;
  type: string;
}): Promise<DuplicateCheckResponse> => {
  try {
    // axiosPrivate interceptor already unwraps response.data
    const data = (await axiosPrivate.post(
      `${EMP_ENDPOINT}/check-duplicate`,
      params
    )) as DuplicateCheckResponse;

    return data;
  } catch (error) {
    // Rethrow so the mutation's onError handler can decide what to do
    console.error('checkDuplicateStampsForEmployee API error:', error);
    throw error;
  }
};
