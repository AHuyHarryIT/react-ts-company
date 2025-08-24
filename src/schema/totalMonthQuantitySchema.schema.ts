import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema
} from '@schemas/defaultModel.schema';

export const totalMonthQuantitySchema = defaultModelSchema.extend({
  product_id: z.string(),
  status: z.number(),
  month: z.string(),
  totalQuan: z.number(),
  product: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .optional()
});
export const totalMonthQuantityCreateSchema = overrideSchema(
  totalMonthQuantitySchema
);
export const totalMonthQuantityUpdateSchema = overrideSchema(
  totalMonthQuantitySchema
);
