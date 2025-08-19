import axiosPrivate from '@/api/axiosInstance';
import { ProductType } from '@/types/productType';
import {
  TodosType,
  TodoCreateType,
  TodoUpdateQuantityType,
  TodoHistoryRequest
} from '@/types/todoType';

const Emp_ENDPOINT = 'api/employee/todos';

export const fetchTodoList = async () => {
  const response = await axiosPrivate.get<TodosType, { data: TodosType[] }>(
    Emp_ENDPOINT
  );
  return response.data;
};

export const createTodo = async (data: TodoCreateType) => {
  const response = await axiosPrivate.post<
    Omit<TodosType, 'product'>,
    Omit<TodosType, 'product'>
  >(Emp_ENDPOINT, data);
  return response;
};

export const updateTodoQuantity = async (data: TodoUpdateQuantityType) => {
  const response = await axiosPrivate.put(`${Emp_ENDPOINT}/quantity`, data);
  return response;
};

export const updateTodoQuantityError = async (data: TodoUpdateQuantityType) => {
  const response = await axiosPrivate.put(
    `${Emp_ENDPOINT}/quantity/error`,
    data
  );
  return response;
};

export const fetchTodoHistory = async (params: TodoHistoryRequest) => {
  const response = await axiosPrivate.get<
    TodosType,
    { data: TodosType[]; products: ProductType[] }
  >(`${Emp_ENDPOINT}/history`, { params });
  return response;
};
