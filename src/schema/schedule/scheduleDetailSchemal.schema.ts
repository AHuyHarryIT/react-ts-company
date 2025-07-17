import { z } from 'zod';

import {
  defaultModelSchema,
  makeUpdateSchema,
  overrideSchema
} from '../defaultModel.schema';
import { employeeSchema } from '@schemas/employeeSchema.schema';
import { scheduleSchema } from './scheduleSchema.schema';
import { hnhcEnum } from '@constants/hnhc.enum';

export const scheduleDetailSchema = defaultModelSchema
  .extend({
    date: z.string(),
    employee_id: employeeSchema.shape.id,
    schedule_id: scheduleSchema.shape.id,
    is_wc_clean_men: z.boolean().default(false),
    is_wc_clean_women: z.boolean().default(false),
    is_wc_trash: z.boolean().default(false),
    is_eat_room: z.boolean().default(false),
    hnhc: hnhcEnum,
    employee: employeeSchema.optional()
  })
  .omit({
    id: true
  });
export const scheduleDetailCreateSchema = overrideSchema(scheduleDetailSchema);
export const scheduleDetailUpdateSchema = makeUpdateSchema(
  scheduleDetailCreateSchema
);
