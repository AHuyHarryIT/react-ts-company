import { FieldConfig } from '@/types/form';
import dayjs from 'dayjs';

interface FormatJsonDataProps<T extends object> {
  data: T;
  fields?: FieldConfig[];
}

export function formatJsonData<TData extends object>({
  data,
  fields
}: FormatJsonDataProps<TData>) {
  const formattedData: Record<string, string | number | boolean | object> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    const fieldType = fields?.find((field) => field.name === key)?.type;

    if (dayjs.isDayjs(value)) {
      let format = 'YYYY-MM-DD';
      if (fieldType === 'time') format = 'HH:mm:ss';
      else if (fieldType === 'datetime') format = 'YYYY-MM-DD HH:mm:ss';
      formattedData[key] = value.format(format);
    } else {
      formattedData[key] = value;
    }
  }
  return formattedData;
}
