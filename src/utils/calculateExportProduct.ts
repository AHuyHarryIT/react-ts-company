import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';

const toNumber = (value: number | string | undefined | null) =>
  Number(value || 0);

/**
 * Status xuất hàng hợp lệ:
 * - status 3: dữ liệu cũ (trước tháng 05-2026) — BE chưa migrate sang status 8
 * - status 8: dữ liệu mới (từ tháng 05-2026 trở đi)
 *
 * TODO (BE): Sau khi BE thống nhất về 1 status duy nhất thì bỏ status 3 ở đây.
 */
const EXPORT_STATUSES = [3, 8];

export type ExportTableResult = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

export function calculateExportProduct(
  products: ProductType[]
): ExportTableResult[] {
  return products.map((product) => {
    const timeMap: ExportTableResult['times'] = {};

    const totalDailyQuantitiesPO = product.totaldailyquantitiespo || [];
    const total = totalDailyQuantitiesPO
      .filter((item) => EXPORT_STATUSES.includes(item.status))
      .reduce((acc, item) => acc + toNumber(item.totalQuan), 0);

    totalDailyQuantitiesPO
      .filter((item) => EXPORT_STATUSES.includes(item.status))
      .forEach((time) => {
        const dateKey = dayjs(time.date).format('DD-MM-YYYY');

        if (!timeMap[dateKey]) {
          timeMap[dateKey] = { quantity: 0 };
        }
        timeMap[dateKey].quantity += toNumber(time.totalQuan);
      });

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      total: total,
      times: timeMap
    };
  });
}
