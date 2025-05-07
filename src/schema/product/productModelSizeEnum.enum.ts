import { z } from 'zod';

export const productModelSizeEnum = z.enum([
  '350×350',
  '500×500',
  '550×550',
  '700×700',
  '800×700'
]);
export type ProductModelSize = z.infer<typeof productModelSizeEnum>;

export const ProductModelSizeEnumOptions: {
  label: string;
  value: ProductModelSize;
}[] = productModelSizeEnum.options.map((item) => ({
  label: item,
  value: item
}));
