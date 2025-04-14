import { z } from 'zod';

import {
  defaultModelSchema,
  makeCreateSchema,
  makeUpdateSchema
} from './defaultModel.schema';

export const roleSchema = defaultModelSchema.extend({
  role_name: z.string()
});

export const roleCreateSchema = makeCreateSchema(roleSchema);
export const roleUpdateSchema = makeUpdateSchema(roleCreateSchema);
