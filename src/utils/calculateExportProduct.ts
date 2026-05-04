import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';

const toNumber = (value: number | string | undefined | null) =>
  Number(value || 0);

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
      .filter((item) => item.status === 8)
      .reduce((acc, item) => acc + toNumber(item.totalQuan), 0);

    totalDailyQuantitiesPO
      .filter((item) => item.status === 8)
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
