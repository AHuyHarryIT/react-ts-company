import { z } from 'zod';

export const productStatus = z.nativeEnum({
  PRODUCE: 1,
  CHECK200: 2,
  INVENTORY: 4,
  INVENTORY_CHECK200: 5,
  ERROR: 6,
  MOQ: 7,
  EXPORT: 8
});

export type ProductStatusType = z.infer<typeof productStatus>;

export const productStatusOptions: {
  label: string;
  value: ProductStatusType;
}[] = [
  { label: 'Hàng sản xuất', value: productStatus.enum.PRODUCE },
  { label: 'Kiểm tra 200%', value: productStatus.enum.CHECK200 },
  { label: 'Xuất kho PO', value: productStatus.enum.EXPORT },
  { label: 'Tồn kho', value: productStatus.enum.INVENTORY },
  {
    label: 'Kiểm tra tồn kho 200%',
    value: productStatus.enum.INVENTORY_CHECK200
  },
  { label: 'Hàng lỗi', value: productStatus.enum.ERROR },
  { label: 'MOQ', value: productStatus.enum.MOQ }
];
