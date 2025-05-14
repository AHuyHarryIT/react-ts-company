import { z } from 'zod';

export const productModelEnum = z.enum([
  '1/6-300K5W',
  '1/6-300K6S',
  '1/6-450K5W',
  '1/6-450K6S',
  '1/8-300K5W',
  'VVP 01',
  '1/12-150K5S',
  '1/16-150K5S',
  '1/24-150K5S',
  '1/12-300K5S'
]);
export type ProductModel = z.infer<typeof productModelEnum>;

export const ProductModelEnumOptions: { label: string; value: ProductModel }[] =
  productModelEnum.options.map((item) => ({
    label: item,
    value: item
  }));
