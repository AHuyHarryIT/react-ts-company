import { z, ZodObject, ZodRawShape } from 'zod';
import dayjs from 'dayjs';

const systemFields = {
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
} as const;

export const defaultModelSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional()
});

export const overrideSchema = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrides: Partial<ZodRawShape> = {}
) => schema.omit(systemFields).extend(overrides as ZodRawShape);

export const makeUpdateSchema = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrides: Partial<ZodRawShape> = {}
) => {
  const shape = schema
    .omit(systemFields)
    .extend(overrides as ZodRawShape).shape;

  const updateShape: ZodRawShape = Object.entries(shape).reduce(
    (acc, [key, value]) => {
      acc[key] = value.optional().nullable();
      return acc;
    },
    {} as ZodRawShape
  );

  return z.object(updateShape).extend({
    id: schema.shape.id
  });
};

// A custom Zod schema to transform into a dayjs object
export const dayjsSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' || value instanceof Date) {
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed : undefined;
    }
    return value;
  },
  z.custom<dayjs.Dayjs>((val) => dayjs.isDayjs(val), {
    message: 'Ngày không hợp lệ'
  })
);
