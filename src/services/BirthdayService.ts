import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';

const END_POINT = '/api/birthday';

export const getBirthday = async () => {
  const response = await axiosPrivate.get<EmployeeType, EmployeeType[]>(
    END_POINT
  );
  return response;
};
