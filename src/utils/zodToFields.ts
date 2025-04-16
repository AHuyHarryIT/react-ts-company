import {
  ZodEnum,
  ZodNativeEnum,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodTypeAny
} from 'zod';

import { FieldConfig } from '@/types/form';

type ZodField = ZodTypeAny;

export const zodToFields = (schema: ZodObject<ZodRawShape>): FieldConfig[] => {
  const shape = schema.shape;
  const fields: FieldConfig[] = [];

  for (const key in shape) {
    const rawField: ZodField = shape[key];
    const unwrapped = unwrap(rawField);
    const required = !isOptionalOrNullable(rawField);
    const type = getFieldType(unwrapped, key);
    const options = getEnumOptions(unwrapped);

    fields.push({
      name: key,
      label: formatLabel(key),
      type,
      required,
      options
    });
  }

  return fields;
};

const unwrap = (field: ZodField): ZodField => {
  if (field instanceof ZodOptional || field instanceof ZodNullable) {
    return unwrap(field._def.innerType);
  }
  return field;
};

const isOptionalOrNullable = (field: ZodField): boolean => {
  return field instanceof ZodOptional || field instanceof ZodNullable;
};

const formatLabel = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getFieldType = (field: ZodField, key: string): FieldConfig['type'] => {
  const t = field._def.typeName;
  if (['photo', 'image', 'avatar', 'file'].includes(key.toLowerCase()))
    return 'file';
  if (key.toLowerCase().includes('password')) return 'password';

  switch (t) {
    case 'ZodString':
      return 'text';
    case 'ZodNumber':
      return 'number';
    case 'ZodDate':
      return 'date';
    case 'ZodBoolean':
      return 'select'; // hoặc switch
    case 'ZodEnum':
    case 'ZodNativeEnum':
      return 'select';
    default:
      return 'text';
  }
};

const getEnumOptions = (
  field: ZodField
): FieldConfig['options'] | undefined => {
  if (field instanceof ZodEnum) {
    return field.options.map((opt: string) => ({
      label: formatLabel(opt),
      value: opt
    }));
  }

  if (field instanceof ZodNativeEnum) {
    return Object.values(field.enum).map((val) => ({
      label: formatLabel(String(val)),
      value: val as string | number
    }));
  }

  return undefined;
};
