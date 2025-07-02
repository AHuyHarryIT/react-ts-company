import { z } from 'zod';

export const ShiftEnum = z.nativeEnum({
  SHIFT1: 1,
  SHIFT2: 2
});

export const ShiftEnumOptions: { label: string; value: number }[] = [
  { label: 'Ca 1', value: ShiftEnum.enum.SHIFT1 },
  { label: 'Ca 2', value: ShiftEnum.enum.SHIFT2 }
];
