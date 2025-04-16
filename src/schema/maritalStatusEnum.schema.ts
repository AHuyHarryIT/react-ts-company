import { z } from 'zod';

export const maritalStatusEnum = z.enum([
  'single',
  'married',
  'divorced',
  'widowed'
]);
export type MaritalStatus = z.infer<typeof maritalStatusEnum>;

export const MaritalStatusEnumOptions: {
  label: string;
  value: MaritalStatus;
}[] = [
  { label: 'Độc thân', value: 'single' },
  { label: 'Đã kết hôn', value: 'married' },
  { label: 'Ly hôn', value: 'divorced' },
  { label: 'Góa', value: 'widowed' }
];
