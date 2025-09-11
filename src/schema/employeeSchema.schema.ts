import { z } from 'zod';

import {
  dayjsSchema,
  defaultModelSchema,
  overrideSchema
} from './defaultModel.schema';
import { genderEnum } from './genderEnum.schema';
import { maritalStatusEnum } from './maritalStatusEnum.schema';
import { scheduleCategorySchema } from './schedule/scheduleCategorySchema.schema';
import { roleSchema } from './roleSchema.schema';

export const employeeSchema = defaultModelSchema.extend({
  name: z.string(),
  // code: z.string(),
  phone: z.string(),
  email: z.string().email().nullable().optional(),
  CCCD: z.string(),
  address: z.string(),
  home_town: z.string(),
  birthday: z.string(),
  gender: genderEnum,
  marital_status: maritalStatusEnum,
  company: z.string(),
  date_joining: z.string(),
  role_id: z.union([z.string(), z.number()]),
  calendar_category_id: z.union([z.string(), z.number()]),
  photo: z.string(),
  card_photo: z.string(),
  calendar_category: scheduleCategorySchema.optional(),
  role: roleSchema.optional()
});

export const employeeCreateSchema = overrideSchema(employeeSchema, {
  id: z.string(),
  card_photo: z.instanceof(File),
  birthday: dayjsSchema,
  date_joining: dayjsSchema
}).omit({
  calendar_category: true,
  role: true,
  photo: true
});

export const employeeUpdateSchema = overrideSchema(employeeSchema, {
  card_photo: z.instanceof(File).optional(),
  birthday: dayjsSchema,
  date_joining: dayjsSchema
}).omit({
  calendar_category: true,
  role: true,
  photo: true
});
