import { ZodObject, ZodRawShape } from 'zod';
import { AxiosRequestConfig } from 'axios';

import { useDynamicCrudForm } from '@/hooks/useDynamicCrudForm';
import { FieldConfig } from '@/types/form';
import { DynamicForm } from '@components/DynamicForm';
import { CrudServiceType } from '@utils/crudService';
import { zodToAntdRules } from '@utils/zodToAntdRules';

interface CreateRoleFormProps<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
> {
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
  isGrid?: boolean;
  config?: AxiosRequestConfig;
}

export function CreateForm<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  service,
  schema,
  fields = [],
  isGrid = true,
  config = {}
}: CreateRoleFormProps<TData, TCreateDto, TUpdateDto>) {
  const ruleMap = zodToAntdRules({ schema, fields });

  const { form, handleFinish, isLoading, resetForm } = useDynamicCrudForm({
    service: service,
    onSuccess: (): void => resetForm(),
    schema: schema,
    config: config
  });

  return (
    <DynamicForm
      form={form}
      fields={fields}
      onFinish={handleFinish}
      loading={isLoading}
      submitButtonText="Thêm"
      size="large"
      resetForm={resetForm}
      zodRules={ruleMap}
      isGrid={isGrid}
    />
  );
}
