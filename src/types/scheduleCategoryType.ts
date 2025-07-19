import {
  scheduleCategoryCreateSchema,
  scheduleCategorySchema,
  scheduleCategoryUpdateSchema
} from '@schemas/schedule/scheduleCategorySchema.schema';
import { z } from 'zod';

export type ScheduleCategoryType = z.infer<typeof scheduleCategorySchema>;
export type ScheduleCategoryCreateType = z.infer<
  typeof scheduleCategoryCreateSchema
>;
export type ScheduleCategoryUpdateType = z.infer<
  typeof scheduleCategoryUpdateSchema
>;
