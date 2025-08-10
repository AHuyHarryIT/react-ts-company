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

export type ProductStatusType = z.infer<typeof productStatus>;

export const productStatusOptions: {
  label: string;
  value: ProductStatusType;
}[] = [
  { label: 'Hàng sản xuất', value: productStatus.enum.PRODUCE },
  { label: 'Kiểm tra 200%', value: productStatus.enum.CHECK200 },
  { label: 'Xuất kho', value: productStatus.enum.EXPORT },
  { label: 'Tồn kho', value: productStatus.enum.INVENTORY },
  {
    label: 'Kiểm tra tồn kho 200%',
    value: productStatus.enum.INVENTORY_CHECK200
  },
  { label: 'Hàng lỗi', value: productStatus.enum.ERROR },
  { label: 'MOQ', value: productStatus.enum.MOQ },
  { label: 'Tổng hợp hàng ngày', value: productStatus.enum.TOTAL_DAILY }
];
