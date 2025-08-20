import axiosPrivate from '@/api/axiosInstance';
import { AddPoExportRequest, AddPoRequest } from '@/types/purchaseOrdersType';

const ENDPOINT = '/api/check-po';

export const AddPurchaseOrdersQuantities = async (data: AddPoRequest) => {
  const response = await axiosPrivate.post(`${ENDPOINT}/import`, data);
  return response;
};

export const AddPurchaseOrdersQuantitiesExport = async (
  data: AddPoExportRequest
) => {
  const response = await axiosPrivate.post(`${ENDPOINT}/export`, data);
  return response;
};
