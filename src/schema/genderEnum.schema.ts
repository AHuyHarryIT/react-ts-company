import { z } from 'zod';

export const genderEnum = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof genderEnum>;

export const GenderEnumOptions: { label: string; value: Gender }[] = [
  { label: 'Nam', value: 'male' },
  {
    label: 'Nữ',
    value: 'female'
  },
  {
    label: 'Khác',
    value: 'other'
  }
];
