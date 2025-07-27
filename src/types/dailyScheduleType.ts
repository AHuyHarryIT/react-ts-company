import { z } from 'zod';

import {
  dailyScheduleCreateSchema,
  dailyScheduleSchema,
  dailyScheduleUpdateSchema
} from '@schemas/dailyScheduleSchema.schema';

export type DailyScheduleType = z.infer<typeof dailyScheduleSchema>;

export type DailyScheduleCreateType = z.infer<typeof dailyScheduleCreateSchema>;

export type DailyScheduleUpdateType = z.infer<typeof dailyScheduleUpdateSchema>;
