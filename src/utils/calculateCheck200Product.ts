import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';

export type Check200TableResult = {
  id: string;
  name: string;
  code: string;
  startStock: number;
  incurred: number;

  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

export function calculateCheck200Product(
  products: ProductType[]
  // month: Dayjs | null
): Check200TableResult[] {
  return products.map((product) => {
    const timeMap: Check200TableResult['times'] = {};

    const totalMonthQuantities = product.totalmonthquantities || [];

    const startStock = totalMonthQuantities.find(
      (item) => item.status === 5
    )?.totalQuan;
    const incurred = totalMonthQuantities.find(
      (item) => item.status === 2
    )?.totalQuan;

    (product.totaldailyquantities || [])
      .filter((item) => item.status === 2)
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
      startStock: startStock ?? 0,
      incurred: incurred ?? 0,
      times: timeMap
    };
  });
}
