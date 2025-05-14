import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema
} from '@schemas/defaultModel.schema';

export const totalDayQuantitySchema = defaultModelSchema.extend({
  product_id: z.string(),
  status: z.number(),
  date: z.string(),
  totalQuan: z.number()
});
export const totalDayQuantityCreateSchema = overrideSchema(
  totalDayQuantitySchema
);
export const totalDayQuantityUpdateSchema = overrideSchema(
  totalDayQuantitySchema
);
