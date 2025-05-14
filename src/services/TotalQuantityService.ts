import axiosPrivate from '@/api/axiosInstance';
import { PaginatedResponse } from '@/types/responseTypes';
import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';

const ENDPOINT = '/api/quantities';

export const getMonthlyQuantity = async ({
  productId,
  month,
  status,
  signal
}: {
  productId: string;
  month: string;
  status?: number;
  signal?: AbortSignal;
}) => {
  const response = await axiosPrivate.get<
    TotalMonthQuantityType,
    PaginatedResponse<TotalMonthQuantityType>
  >(`${ENDPOINT}/monthly`, {
    params: {
      productId: productId,
      month: month,
      status: status
    },
    signal: signal
  });
  return response.data;
};

export const getMonthlyQuantities = async ({
  limit,
  page,
  status,
  signal
}: {
  limit?: number;
  page?: number;
  status?: number;
  signal?: AbortSignal;
}) => {
  const response = await axiosPrivate.get<
    TotalMonthQuantityType,
    PaginatedResponse<TotalMonthQuantityType>
  >(`${ENDPOINT}/monthly`, {
    params: {
      limit: limit,
      page: page,
      status: status
    },
    signal: signal
  });
  return response.data;
};
