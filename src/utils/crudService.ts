import { AxiosRequestConfig } from 'axios';

import axiosPrivate from '@/api/axiosInstance';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';

export type CrudServiceType<
  TData,
  TCreateDto,
  TUpdateDto = TCreateDto
> = CrudService<TData, TCreateDto, TUpdateDto>;

export class CrudService<
  TData, // Entity data type (e.g. Employee)
  TCreateDto, // Type for create payload
  TUpdateDto = TCreateDto // Optionally allow a different update payload
> {
  constructor(private endpoint: string) {}

  list(params?: QueryParams) {
    return axiosPrivate.get<TData, PaginatedResponse<TData>>(this.endpoint, {
      params
    });
  }

  get(id: number | string, config?: AxiosRequestConfig) {
    return axiosPrivate.get<TData, TData>(`${this.endpoint}/${id}`, config);
  }

  create(data: TCreateDto, config?: AxiosRequestConfig) {
    return axiosPrivate.post<TData, TData>(this.endpoint, data, config);
  }

  update(id: number | string, data: TUpdateDto, config?: AxiosRequestConfig) {
    return axiosPrivate.post<TData, TData>(
      `${this.endpoint}/${id}`,
      data,
      config
    );
  }

  delete(id: number | string) {
    return axiosPrivate.delete(`${this.endpoint}/${id}`);
  }
}
