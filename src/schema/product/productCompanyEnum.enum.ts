import { z } from 'zod';

export const productCompanyEnum = z.enum(['FAPV', 'FASV', 'FAVV']);
export type ProductCompany = z.infer<typeof productCompanyEnum>;
export const ProductCompanyEnumOptions: {
  label: string;
  value: ProductCompany;
}[] = [
  {
    label: 'FAPV出荷',
    value: 'FAPV'
  },
  {
    label: 'FASV出荷',
    value: 'FASV'
  },
  {
    label: 'FAVV出荷',
    value: 'FAVV'
  }
];
