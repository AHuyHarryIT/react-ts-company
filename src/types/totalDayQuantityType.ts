import {
  totalDayQuantityCreateSchema,
  totalDayQuantitySchema,
  totalDayQuantityUpdateSchema
} from '@schemas/totalDayQuantitySchema.schema';
import { z } from 'zod';

export type TotalDayQuantityType = z.infer<typeof totalDayQuantitySchema>;
export type TotalDayQuantityCreateType = z.infer<
  typeof totalDayQuantityCreateSchema
>;
export type TotalDayQuantityUpdateType = z.infer<
  typeof totalDayQuantityUpdateSchema
>;
