import axiosPrivate from '@/api/axiosInstance';
import { AddPoRequest } from '@/types/purchaseOrdersType';

const ENDPOINT = '/api/check-po';

export const AddPurchaseOrdersQuantities = async (data: AddPoRequest) => {
  const response = await axiosPrivate.post(`${ENDPOINT}/import`, data);
  return response;
};
