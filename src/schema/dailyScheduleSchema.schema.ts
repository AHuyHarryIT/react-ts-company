import { z } from 'zod';

import {
  defaultModelSchema,
  overrideSchema,
  makeUpdateSchema
} from './defaultModel.schema';
import { productSchema } from './product/productSchema.schema';
import { employeeSchema } from './employeeSchema.schema';
import { dailyQuantitiesSchema } from './dailyQuantitiesSchema.schema';

export const dailyScheduleSchema = defaultModelSchema.extend({
  product_id: productSchema.shape.id,
  employee_id: employeeSchema.shape.id,
  shift: z.string(), // TODO: wait BE change shift type
  date: z.string().datetime(),
  status: z.string(),
  dailyQuantities: dailyQuantitiesSchema.array().optional(),
  employee: employeeSchema.optional(),
  product: productSchema.optional()
});

export const dailyScheduleCreateSchema = overrideSchema(
  dailyScheduleSchema
).omit({
  employee: true,
  product: true,
  dailyQuantities: true
});
export const dailyScheduleUpdateSchema = makeUpdateSchema(
  dailyScheduleSchema
).omit({
  employee: true,
  product: true,
  dailyQuantities: true
});
