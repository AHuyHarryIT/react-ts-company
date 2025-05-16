import { z } from 'zod';

import {
  dailyQuantitiesCreateSchema,
  dailyQuantitiesSchema,
  dailyQuantitiesUpdateSchema
} from '@schemas/dailyQuantitiesSchema.schema';

export type DailyQuantitiesType = z.infer<typeof dailyQuantitiesSchema>;
export type DailyQuantitiesCreateType = z.infer<
  typeof dailyQuantitiesCreateSchema
>;
export type DailyQuantitiesUpdateType = z.infer<
  typeof dailyQuantitiesUpdateSchema
>;
