import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema
} from '@schemas/defaultModel.schema';

export const totalMonthQuantitySchema = defaultModelSchema.extend({
  product_id: z.string(),
  status: z.number(),
  month: z.string(),
  totalQuan: z.number()
});
export const totalMonthQuantityCreateSchema = overrideSchema(
  totalMonthQuantitySchema
);
export const totalMonthQuantityUpdateSchema = overrideSchema(
  totalMonthQuantitySchema
);
