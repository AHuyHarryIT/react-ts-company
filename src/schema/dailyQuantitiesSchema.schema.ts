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
  created_at_formatted: z.string().datetime().optional()
});

export const dailyQuantitiesCreateSchema = overrideSchema(
  dailyQuantitiesSchema
);

export const dailyQuantitiesUpdateSchema = overrideSchema(
  dailyQuantitiesSchema
);
