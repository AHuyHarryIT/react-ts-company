import { z } from 'zod';

export const hnhcEnum = z.nativeEnum({
  N: 'Ngày',
  D: 'Đêm',
  TC: 'Tăng cường đêm',
  LN: 'Làm ngày',
  X: 'Nghỉ'
});
