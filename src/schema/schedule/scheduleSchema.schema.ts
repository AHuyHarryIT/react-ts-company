import { z } from 'zod';

import {
  defaultModelSchema,
  makeUpdateSchema,
  overrideSchema
} from '../defaultModel.schema';

export const scheduleSchema = defaultModelSchema.extend({
  title: z.string(),
  date: z.string()
});
export const scheduleCreateSchema = overrideSchema(scheduleSchema);
export const scheduleUpdateSchema = makeUpdateSchema(scheduleCreateSchema);
