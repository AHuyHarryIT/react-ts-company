import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema,
  makeUpdateSchema
} from './defaultModel.schema';
import { employeeSchema } from './employeeSchema.schema';

export const attendanceSchema = defaultModelSchema.extend({
  id: z.string(),
  employee_code: z.string(),
  datetime: z.string(),
  date: z.string(),
  time: z.string(),
  employee: employeeSchema.optional()
});

export const attendanceCreateSchema = overrideSchema(attendanceSchema);

export const attendanceUpdateSchema = makeUpdateSchema(attendanceSchema);
