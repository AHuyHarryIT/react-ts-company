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

export const makeCreateSchema = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrides: Partial<ZodRawShape> = {}
) => schema.omit(systemFields).extend(overrides as ZodRawShape);

export const makeUpdateSchema = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrides: Partial<ZodRawShape> = {}
) =>
  schema
    .omit(systemFields)
    .extend(overrides as ZodRawShape)
    .partial()
    .extend({
      id: schema.shape.id
    });

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
    message: 'Invalid date'
  })
);
