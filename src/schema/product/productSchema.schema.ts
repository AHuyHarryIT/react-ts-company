import { z } from 'zod';

import { defaultModelSchema, overrideSchema } from '../defaultModel.schema';

export const productSchema = defaultModelSchema.extend({
  code: z.string().nullable(),
  name: z.string().nullable(),
  quantity: z.number().nullable(),
  moldSize: z.string().nullable(),
  CAV: z.number().nullable(),
  cycle: z.number().nullable(),
  FAPV: z.number().nullable(),
  FASV: z.number().nullable(),
  FAVV: z.number().nullable(),
  binCode: z.string().nullable(),
  quanEntityBin: z.string().nullable()
  // material: z.string().nullable(),
  // color: z.string().nullable(),
  // quantity_per_package: z.number().nullable()
});

export const productCreateSchema = overrideSchema(productSchema);

export const productUpdateSchema = overrideSchema(productSchema);
