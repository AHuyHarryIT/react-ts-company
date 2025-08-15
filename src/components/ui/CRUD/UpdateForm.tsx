import { ZodObject, ZodRawShape } from 'zod';
import { AxiosRequestConfig } from 'axios';

import { useDynamicCrudForm } from '@/hooks/useDynamicCrudForm';
import { FieldConfig } from '@/types/form';
import { DynamicForm } from '@components/DynamicForm';
import { CrudServiceType } from '@utils/crudService';
import { zodToAntdRules } from '@utils/zodToAntdRules';

interface UpdateFormProps<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
> {
  id: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
  onSuccess?: () => void;
  isGrid?: boolean;
  config?: AxiosRequestConfig;
}

export function UpdateForm<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  id,
  service,
  schema,
  fields = [],
  onSuccess,
  isGrid = true,
  config = {}
}: UpdateFormProps<TData, TCreateDto, TUpdateDto>) {
  const ruleMap = zodToAntdRules({ schema, fields });

  const { form, handleFinish, isLoading } = useDynamicCrudForm<
    TData,
    TCreateDto,
    TUpdateDto
  >({
    id: id,
    service: service,
    onSuccess: (): void => {
      onSuccess?.();
    },
    schema: schema,
    config: config,
    fields: fields,
    isFetchData: true
  });

  return (
    <DynamicForm
      form={form}
      fields={fields}
      onFinish={handleFinish}
      loading={isLoading}
      submitButtonText="Cập nhật"
      zodRules={ruleMap}
      isGrid={isGrid}
    />
  );
}
