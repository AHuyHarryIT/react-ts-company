import { FieldConfig } from '@/types/form';
import dayjs from 'dayjs';

interface ConvertToFormDataProps {
  // TODO: find another type to replace Record<string, any>. Not unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
  action: 'update' | 'create';
  fields?: FieldConfig[];
}

export function convertToFormData({
  values,
  action,
  fields
}: ConvertToFormDataProps) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const field = fields?.find((f) => f.name === key && f.type === 'image');
    if (field && typeof value === 'string') return;

    if (field && value?.fileList?.[0]?.originFileObj) {
      formData.append(key, value.fileList[0].originFileObj);
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (value?.fileList?.[0]?.originFileObj) {
      formData.append(key, value.fileList[0].originFileObj);
    } else if (dayjs.isDayjs(value)) {
      formData.append(key, value.format('YYYY-MM-DD'));
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    } else {
      formData.append(key, value);
    }
  });

  if (action === 'update') {
    formData.append('_method', 'PATCH');
  }

  return formData;
}
