import { z } from 'zod';

import {
  defaultModelSchema,
  makeUpdateSchema,
  overrideSchema
} from '../defaultModel.schema';

export const scheduleCategorySchema = defaultModelSchema.extend({
  name: z.string()
});
export const scheduleCategoryCreateSchema = overrideSchema(
  scheduleCategorySchema
);
export const scheduleCategoryUpdateSchema = makeUpdateSchema(
  scheduleCategorySchema
);
