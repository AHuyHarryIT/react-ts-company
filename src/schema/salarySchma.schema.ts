import { z } from 'zod';

import { defaultModelSchema, overrideSchema } from './defaultModel.schema';

export const salarySchema = defaultModelSchema.extend({
  title: z.string(),
  total: z.number(),
  start_date: z.string(),
  end_date: z.string()
});

export const roleCreateSchema = overrideSchema(salarySchema);
