import { z } from 'zod';

import {
  totalDailyQuantityPoCreateSchema,
  totalDailyQuantityPoSchema,
  totalDailyQuantityPoUpdateSchema
} from '@schemas/totalDailyQuantityPoSchema.schema';

export type TotalDailyQuantityPoType = z.infer<
  typeof totalDailyQuantityPoSchema
>;
export type TotalDailyQuantityPoCreateType = z.infer<
  typeof totalDailyQuantityPoCreateSchema
>;
export type TotalDailyQuantityPoUpdateType = z.infer<
  typeof totalDailyQuantityPoUpdateSchema
>;
