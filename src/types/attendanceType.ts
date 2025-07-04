import { z } from 'zod';

import {
  attendanceCreateSchema,
  attendanceSchema,
  attendanceUpdateSchema
} from '@schemas/attendanceSchema.schema';

export type AttendanceType = z.infer<typeof attendanceSchema>;

export type AttendanceCreateType = z.infer<typeof attendanceCreateSchema>;

export type AttendanceUpdateType = z.infer<typeof attendanceUpdateSchema>;
