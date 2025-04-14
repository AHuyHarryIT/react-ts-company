import axiosPrivate from '@/api/axiosInstance';
import {
  EmployeeCreateType,
  EmployeeType,
  EmployeeUpdateType
} from '@/types/employeeType';
import { CrudService } from '@utils/crudService';

export type FilterEmployee = {
  company?: string;
  role?: string;
  sort?: string;
};

export type FetchEmployeesParams = {
  page?: number;
  limit?: number;
  filters?: FilterEmployee;
};

export type AddEmployeeParams = EmployeeCreateType;

const ENDPOINT = '/api/employees';

export const employeeService = new CrudService<
  EmployeeType,
  EmployeeCreateType,
  EmployeeUpdateType
>('/api/employees');

export const addEmployeeConverted = async (data: FormData) => {
  await axiosPrivate.post(ENDPOINT, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const addEmployee = async (data: AddEmployeeParams) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('phone', data.phone);
  formData.append('code', data.code);
  formData.append('email', data.email);
  formData.append('cccd', data.cccd);
  formData.append('address', data.address);
  formData.append('home_town', data.home_town);
  formData.append('birthday', data.birthday);
  formData.append('gender', data.gender);
  formData.append('marital_status', data.marital_status);
  formData.append('company', data.company);
  formData.append('date_joining', data.date_joining);
  formData.append('role_id', data.role_id);
  formData.append('category_celender_id', data.category_celender_id);
  formData.append('photo', data.photo);
  formData.append('card_photo', data.card_photo);

  await axiosPrivate.post(ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateEmployee = async () => {};

export const deleteEmployee = async (id: string) => {
  await axiosPrivate.delete(`${ENDPOINT}/${id}`);
};
