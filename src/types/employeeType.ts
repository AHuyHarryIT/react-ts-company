import { z } from 'zod';

import {
  employeeCreateSchema,
  employeeSchema,
  employeeUpdateSchema
} from '@/schema/employeeSchema.schema';

export type EmployeeType = z.infer<typeof employeeSchema>;

export type EmployeeCreateType = z.infer<typeof employeeCreateSchema>;

export type EmployeeUpdateType = z.infer<typeof employeeUpdateSchema>;
