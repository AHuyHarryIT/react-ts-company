import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, message } from 'antd';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import { ZodObject, ZodRawShape } from 'zod';

import { ApiErrorResponse } from '@/types/apiType';
import { convertToFormData } from '@/utils/convertToFormData';
import { CrudServiceType } from '@utils/crudService';
import { handleValidationErrors } from '@utils/handleValidationError';

interface UseDynamicCrudFormProps<TData, TCreateDto, TUpdateDto> {
  id?: string | number;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  convert?: boolean;
  schema?: ZodObject<ZodRawShape>; // optional zod schema
  form?: ReturnType<typeof Form.useForm>[0];
}

export function useDynamicCrudForm<
  TData extends object,
  TCreateDto extends object = TData,
  TUpdateDto extends object = TCreateDto
>({
  id,
  service,
  onSuccess,
  onError,
  convert = true,
  schema,
  form
}: UseDynamicCrudFormProps<TData, TCreateDto, TUpdateDto>) {
  const [internalForm] = Form.useForm();
  const queryClient = useQueryClient();
  const activeForm = form || internalForm;

  type TFormData = TCreateDto | TUpdateDto;

  const {
    data: defaultValues,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['form-data', id],
    queryFn: () => service.get(id!),
    enabled: !!id
  });
  useEffect(() => {
    if (defaultValues) {
      activeForm.setFieldsValue(defaultValues);
    }
  }, [defaultValues]);

  const mutation = useMutation({
    mutationFn: async (values: TFormData) => {
      // ✅ Zod validation
      if (schema) {
        const result = schema.safeParse(values);
        if (!result.success) throw result.error;
        values = result.data as TFormData;
      }

      const payload = convert ? convertToFormData(values) : values;
      return id
        ? service.update(
            id,
            payload as TUpdateDto,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            } as AxiosRequestConfig
          )
        : service.create(
            payload as TCreateDto,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            } as AxiosRequestConfig
          );
    },
    onSuccess: () => {
      message.success(id ? 'Cập nhật thành công' : 'Tạo mới thành công');
      if (!id) {
        activeForm.resetFields();
      }
      queryClient.invalidateQueries();
      onSuccess?.();
    },
    onError: (err) => {
      message.error(id ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
      onError?.(err);
      if (schema) {
        const formatted = handleValidationErrors<TFormData>(
          err as AxiosError<ApiErrorResponse>
        );
        if (formatted) {
          activeForm.setFields(formatted);
        }
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!service.delete) {
        return Promise.reject(new Error('Delete service is not defined'));
      }
      return service.delete(id!);
    },
    onSuccess: () => {
      message.success('Xóa thành công');
      onSuccess?.();
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      message.error('Xóa thất bại');
      onError?.(err);
    }
  });

  return {
    form: activeForm,
    handleFinish: mutation.mutate,
    isLoading: isFetching || mutation.isPending,
    isDeleting: deleteMutation.isPending,
    deleteItem: deleteMutation.mutate,
    refetch,
    resetForm: () => activeForm.resetFields()
  };
}
