import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';
import { handleApiError } from '@utils/handleApiError';
import { message } from 'antd';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

type EmployeeResponse = Omit<EmployeeType, 'role' | 'category_calender'> & {
  role: {
    id: string;
    role_name: string;
  };
  category_celender: {
    id: string;
    name: string;
  };
};

export type FilterEmployee = {
  company?: string;
  role?: string;
};

export type FetchEmployeesParams = {
  page?: number;
  limit?: number;
  filters?: FilterEmployee;
};

export const apiFetchEmployees = async ({
  page,
  limit,
  filters,
}: FetchEmployeesParams) => {
  try {
    const response = await axiosPrivate.get('/api/employees', {
      params: {
        page: page,
        limit: limit,
        ...filters,
      },
    });

    const employeeList: EmployeeType[] = response.data.data.map(
      (employee: EmployeeResponse) => {
        return {
          id: employee.id,
          name: employee.name,
          phone: employee.phone,
          photo: [BASE_URL, 'storage', 'employee', employee.photo].join('/'),
          company: employee.company,
          code: employee.code,
          role: {
            id: employee.role.id,
            name: employee.role.role_name,
          },
          category_calender: {
            id: employee.category_celender.id,
            name: employee.category_celender.name,
          },
        };
      }
    );

    const totalEmployees: number = response.data.total;
    return { employeeList, totalEmployees };
  } catch (error) {
    message.error(handleApiError(error));
    throw new Error(handleApiError(error));
  }
};

export const apiDeleteEmployee = async (id: string) => {
  try {
    await axiosPrivate.delete(`/api/employees/${id}`);
    message.success('Xóa nhân viên thành công');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
