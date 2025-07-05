import { z } from 'zod';

import {
  defaultModelSchema,
  makeUpdateSchema,
  overrideSchema
} from './defaultModel.schema';
import { employeeSchema } from './employeeSchema.schema';

export const attendanceSchema = defaultModelSchema.extend({
  employee_code: z.string(),
  datetime: z.string(),
  date: z.string(),
  time: z.string(),
  employee: employeeSchema.optional()
});

export const attendanceCreateSchema = overrideSchema(attendanceSchema).omit({
  date: true,
  time: true,
  employee: true
});

export const attendanceUpdateSchema = makeUpdateSchema(attendanceSchema).omit({
  id: true,
  employee_code: true,
  date: true,
  time: true,
  employee: true
});
