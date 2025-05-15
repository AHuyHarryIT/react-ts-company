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

export const updateMonthlyQuantities = async ({
  month,
  status,
  products
}: {
  status: number;
  month: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}) => {
  const response = await axiosPrivate.patch(`${ENDPOINT}/monthly/updateList`, {
    month: month,
    status: status,
    products: products
  });
  return response;
};
