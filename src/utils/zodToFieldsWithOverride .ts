import { ZodObject, ZodRawShape } from 'zod';

import { FieldConfig } from '@/types/form';
import { zodToFields } from './zodToFields';

type SchemaKeys<T extends ZodObject<ZodRawShape>> = keyof T['shape'];

type OverrideMap<T extends ZodObject<ZodRawShape>> = {
  [K in SchemaKeys<T>]?: Partial<FieldConfig>;
};

export const zodToFieldsWithOverride = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrideMap: OverrideMap<T>
): FieldConfig[] => {
  const baseFields = zodToFields(schema);
  const schemaKeys = Object.keys(schema.shape);

  if (import.meta.env.DEV) {
    for (const key of Object.keys(overrideMap)) {
      if (!schemaKeys.includes(key)) {
        console.error(
          `[zodToFieldsWithOverride] Invalid override key: "${key}" is not in schema`
        );
      }
    }
  }

  return baseFields
    .map((field) => {
      const override = overrideMap[field.name as keyof typeof overrideMap];
      return override ? { ...field, ...override } : field;
    })
    .sort((a, b) => {
      const aHasIndex = a.index !== undefined;
      const bHasIndex = b.index !== undefined;

      if (aHasIndex && !bHasIndex) return -1;
      if (!aHasIndex && bHasIndex) return 1;

      return (a.index ?? 0) - (b.index ?? 0);
    });
};
