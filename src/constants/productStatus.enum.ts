import { z } from 'zod';

export const productStatus = z.nativeEnum({
  PRODUCE: 1,
  CHECK200: 2,
  EXPORT: 3,
  INVENTORY: 4,
  INVENTORY_CHECK200: 5,
  ERROR: 6,
  MOQ: 7,
  TOTAL_DAILY: 8
});
