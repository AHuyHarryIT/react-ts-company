import { z } from 'zod';

import { defaultModelSchema, overrideSchema } from './defaultModel.schema';
import { employeeSchema } from './employeeSchema.schema';

export const salarySchema = defaultModelSchema.extend({
  title: z.string(),
  total: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  employee: employeeSchema
});

export const salaryCreateSchema = overrideSchema(salarySchema).omit({
  employee: true
});
