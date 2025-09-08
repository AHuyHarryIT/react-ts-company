import axiosPrivate from '@/api/axiosInstance';
import { HistoryFiltersType, HistoryResponseType } from '@/types/historyType';

export const historyService = {
  async getHistory(params: HistoryFiltersType): Promise<HistoryResponseType> {
    const response = await axiosPrivate.get('/api/history', { params });
    return response.data;
  }
};
