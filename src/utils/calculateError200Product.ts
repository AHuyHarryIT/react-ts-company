import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';

export type Error200TableType = {
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

export function calculateError200Product(
  products: ProductType[]
): Error200TableType[] {
  return products.map((product) => {
    const timeMap: Error200TableType['times'] = {};

    const totalMonthQuantities = product.totalmonthquantities || [];

    const total =
      totalMonthQuantities.find((item) => item.status === 6)?.totalQuan || 0;

    (product.totaldailyquantities || [])
      .filter((item) => item.status === 6)
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
