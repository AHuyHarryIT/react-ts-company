import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';

const ENDPOINT = '/api/profile';

export const fetchProfile = async () => {
  const response = await axiosPrivate.get<EmployeeType, EmployeeType>(ENDPOINT);
  return response;
};
