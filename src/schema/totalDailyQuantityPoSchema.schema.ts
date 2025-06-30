import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema
} from '@schemas/defaultModel.schema';

export const totalDailyQuantityPoSchema = defaultModelSchema.extend({
  product_id: z.string(),
  status: z.number(),
  date: z.string(),
  totalQuan: z.number()
});
export const totalDailyQuantityPoCreateSchema = overrideSchema(
  totalDailyQuantityPoSchema
);
export const totalDailyQuantityPoUpdateSchema = overrideSchema(
  totalDailyQuantityPoSchema
);
