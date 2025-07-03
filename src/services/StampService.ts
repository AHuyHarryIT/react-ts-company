import axiosPrivate from '@/api/axiosInstance';
import { Shift } from '@/types/shift';

const ENDPOINT = '/api/stamps';

interface StampLogRequest {
  productId: string;
  date: string;
  shift: Shift;
  binCount: number;
  binStart: string;
  type: 'box' | 'bag' | string;
}

export const saveStamp = (request: StampLogRequest) => {
  const response = axiosPrivate.post(ENDPOINT + '/savePrint', request);
  return response;
};
