import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema
} from '@schemas/defaultModel.schema';

export const dailyQuantitiesSchema = defaultModelSchema.extend({
  product_id: z.string(),
  status: z.number(),
  date: z.string(),
  quantity: z.number(),
  employee_id: z.string(),
  created_at_formatted: z.string().datetime().optional(),
  employee: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .optional(),
  product: z
    .object({
      id: z.string(),
      code: z.string(),
      name: z.string()
    })
    .optional()
});

export const dailyQuantitiesCreateSchema = overrideSchema(
  dailyQuantitiesSchema
).omit({
  created_at_formatted: true
});

export const dailyQuantitiesUpdateSchema = overrideSchema(
  dailyQuantitiesSchema
).omit({
  created_at_formatted: true
});
