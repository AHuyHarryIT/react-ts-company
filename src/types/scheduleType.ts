import { z } from 'zod';

import {
  scheduleCreateSchema,
  scheduleSchema,
  scheduleUpdateSchema
} from '@schemas/schedule/scheduleSchema.schema';

export type ScheduleType = z.infer<typeof scheduleSchema>;
export type ScheduleCreateType = z.infer<typeof scheduleCreateSchema>;
export type ScheduleUpdateType = z.infer<typeof scheduleUpdateSchema>;
