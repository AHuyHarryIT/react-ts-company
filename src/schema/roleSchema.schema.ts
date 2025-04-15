import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema,
  makeUpdateSchema
} from './defaultModel.schema';

export const roleSchema = defaultModelSchema.extend({
  role_name: z.string()
});

export const roleCreateSchema = overrideSchema(roleSchema);
export const roleUpdateSchema = makeUpdateSchema(roleCreateSchema);
