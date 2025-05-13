import { z } from 'zod';

import { defaultModelSchema, overrideSchema } from '../defaultModel.schema';
import { totalMonthQuantitySchema } from '@schemas/totalMonthQuantitySchema.schema';
import { totalDayQuantitySchema } from '@schemas/totalDayQuantitySchema.schema';

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
  totalmonthquantities: totalMonthQuantitySchema.array().optional(),
  totaldailyquantities: totalDayQuantitySchema.array().optional()
});

export const productCreateSchema = overrideSchema(productSchema, {
  stockQuanMOQ: z.number(),
  stockQuan: z.number(),
  stockQuan200: z.number(),
  companies: z.string().array()
}).omit({
  totalmonthquantities: true,
  totaldailyquantities: true,
  quantity: true,
  FAPV: true,
  FASV: true,
  FAVV: true
});

export const productUpdateSchema = overrideSchema(productCreateSchema).omit({
  stockQuan: true,
  stockQuan200: true,
  stockQuanMOQ: true
});
