import { z } from 'zod';

import {
  roleCreateSchema,
  roleSchema,
  roleUpdateSchema
} from '@/schema/roleSchema.schema';

export type RoleType = z.infer<typeof roleSchema>;

export type RoleCreateType = z.infer<typeof roleCreateSchema>;

export type RoleUpdateType = z.infer<typeof roleUpdateSchema>;
