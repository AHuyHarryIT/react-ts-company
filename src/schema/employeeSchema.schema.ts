import { z } from 'zod';

import {
  dayjsSchema,
  defaultModelSchema,
  overrideSchema
} from './defaultModel.schema';
import { genderEnum } from './genderEnum.schema';
import { maritalStatusEnum } from './maritalStatusEnum.schema';

export const employeeSchema = defaultModelSchema.extend({
  name: z.string(),
  code: z.string(),
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
  category_celender_id: z.union([z.string(), z.number()]),
  photo: z.string(),
  card_photo: z.string()
});

export const employeeCreateSchema = overrideSchema(employeeSchema, {
  photo: z.instanceof(File),
  card_photo: z.instanceof(File),
  birthday: dayjsSchema,
  date_joining: dayjsSchema
});

export const employeeUpdateSchema = overrideSchema(employeeSchema, {
  photo: z.instanceof(Image).optional(),
  card_photo: z.instanceof(File).optional(),
  birthday: dayjsSchema,
  date_joining: dayjsSchema
});
