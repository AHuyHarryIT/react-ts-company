import { z } from 'zod';
import { ShiftEnum } from '@constants/shift.enum';

export type Shift = z.infer<typeof ShiftEnum>;
