import { z } from 'zod';

import { defaultModelSchema, overrideSchema } from '../defaultModel.schema';
import { totalMonthQuantitySchema } from '@schemas/totalMonthQuantitySchema.schema';

export const productSchema = defaultModelSchema.extend({
  code: z.string(),
  name: z.string(),
  quantity: z.number(),
  moldSize: z.string(),
  CAV: z.number(),
  cycle: z.number(),
  FAPV: z.number().nullable(),
  FASV: z.number().nullable(),
  FAVV: z.number().nullable(),
  binCode: z.string(),
  quanEntityBin: z.number(),
  // material: z.string().nullable(),
  // color: z.string().nullable(),
  // quantity_per_package: z.number().nullable(),
  totalmonthquantities: totalMonthQuantitySchema.array().optional()
});

export const productCreateSchema = overrideSchema(productSchema);

export const productUpdateSchema = overrideSchema(productSchema);
