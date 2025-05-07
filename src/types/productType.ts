import { z } from 'zod';

import {
  productCreateSchema,
  productSchema,
  productUpdateSchema
} from '@/schema/product/productSchema.schema';

export type ProductType = z.infer<typeof productSchema>;
export type ProductCreateType = z.infer<typeof productCreateSchema>;
export type ProductUpdateType = z.infer<typeof productUpdateSchema>;
