import { ProductType } from '@/types/productType';
import { productStatus } from '@constants/productStatus.enum';
import dayjs from 'dayjs';
import { dateTimeToShift } from './dateTimeToShift';

export type ProduceTableResult = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      shift1: number;
      shift2: number;
    };
  };
};

export function calculateProduceProduct(
  products: ProductType[]
): ProduceTableResult[] {
  return products.map((product) => {
    const timeMap: ProduceTableResult['times'] = {};

    const totalMonthQuantities = product.totalmonthquantities || [];

    const total =
      totalMonthQuantities.find(
        (item) => item.status == productStatus.enum.PRODUCE
      )?.totalQuan || 0;

    (product.dailyquantities || [])
      .filter((item) => item.status == productStatus.enum.PRODUCE)
      .forEach((time) => {
        const dateKey = dayjs(time.date).format('DD-MM-YYYY');
        const shift = dateTimeToShift(dateKey, time.created_at);

        if (!timeMap[dateKey]) {
          timeMap[dateKey] = { shift1: 0, shift2: 0 };
        }

        if (shift === 1) {
          timeMap[dateKey].shift1 += time.quantity;
        } else if (shift === 2) {
          timeMap[dateKey].shift2 += time.quantity;
        }
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
