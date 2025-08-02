import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';

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

    const totalMonthQuantities = product.totalmonthquantities || [];

    const total =
      totalMonthQuantities.find((item) => item.status === 3)?.totalQuan || 0;

    (product.totaldailyquantities || [])
      .filter((item) => item.status === 3)
      .forEach((time) => {
        const dateKey = dayjs(time.date).format('DD-MM-YYYY');

        if (!timeMap[dateKey]) {
          timeMap[dateKey] = { quantity: 0 };
        }
        timeMap[dateKey].quantity += time.totalQuan;
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
