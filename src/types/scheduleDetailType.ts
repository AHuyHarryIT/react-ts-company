import { z } from 'zod';

import {
  scheduleDetailCreateSchema,
  scheduleDetailSchema,
  scheduleDetailUpdateSchema
} from '@schemas/schedule/scheduleDetailSchema.schema';

export type ScheduleDetailType = z.infer<typeof scheduleDetailSchema>;
export type ScheduleDetailCreateType = z.infer<
  typeof scheduleDetailCreateSchema
>;
export type ScheduleDetailUpdateType = z.infer<
  typeof scheduleDetailUpdateSchema
>;
