import { z } from 'zod';

import {
  totalMonthQuantityCreateSchema,
  totalMonthQuantitySchema,
  totalMonthQuantityUpdateSchema
} from '@/schema/totalMonthQuantitySchema.schema';

export type TotalMonthQuantityType = z.infer<typeof totalMonthQuantitySchema>;
export type TotalMonthQuantityCreateType = z.infer<
  typeof totalMonthQuantityCreateSchema
>;
export type TotalMonthQuantityUpdateType = z.infer<
  typeof totalMonthQuantityUpdateSchema
>;
