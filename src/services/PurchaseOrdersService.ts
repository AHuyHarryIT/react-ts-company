import axiosPrivate from '@/api/axiosInstance';
import {
  AddPoExportRequest,
  AddPoInventoryRequest,
  AddPoRequest,
  PurchaseOrdersHistoryResponse,
  UpdatePoRequest
} from '@/types/purchaseOrdersType';

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

export const AddPurchaseOrdersQuantitiesInventory = async (
  data: AddPoInventoryRequest
) => {
  const response = await axiosPrivate.post(`${ENDPOINT}/inventory`, data);
  return response;
};

export const getPurchaseOrdersHistory = async (month?: string) => {
  const response: PurchaseOrdersHistoryResponse = await axiosPrivate.get<
    PurchaseOrdersHistoryResponse,
    PurchaseOrdersHistoryResponse
  >(`${ENDPOINT}/history`, {
    params: { month }
  });
  return response;
};

export const updatePurchaseOrdersQuantities = async (data: UpdatePoRequest) => {
  const response = await axiosPrivate.put(`${ENDPOINT}/`, data);
  return response;
};

export const deletePurchaseOrder = async (id: string) => {
  const response = await axiosPrivate.delete(`${ENDPOINT}/${id}`);
  return response;
};

export const deleteBatchPurchaseOrder = async (batchId: string) => {
  const response = await axiosPrivate.delete(`${ENDPOINT}/batch/${batchId}`);
  return response;
};

export const deleteAllPurchaseOrders = async () => {
  const response = await axiosPrivate.delete(`${ENDPOINT}/all`);
  return response;
};
