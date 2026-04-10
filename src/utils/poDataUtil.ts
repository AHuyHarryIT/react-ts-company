import {
  ErrorTableType,
  ProduceTableType,
  WeekTableType
} from '@/types/poTableType';
import { ProductType } from '@/types/productType';
import dayjs from 'dayjs';
import { dateTimeToShift } from './dateTimeToShift';
import type { Dayjs } from 'dayjs';

export const errorDataSource = (productData: ProductType[]) => {
  return productData.map((product) => {
    const timeMap: ErrorTableType['times'] = {};
    const totalMonthQuantities = product.totalmonthquantities || [];

    const total = totalMonthQuantities.find(
      (item) => item.status === 6
    )?.totalQuan;

    (product.dailyquantities || [])
      .filter((item) => item.status === 6)
      .forEach((time) => {
        const dateKey = dayjs(time.date).format('DD-MM-YYYY');

        if (!timeMap[dateKey]) {
          timeMap[dateKey] = { quantity: 0 };
        }
        timeMap[dateKey].quantity += time.quantity;
      });

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      total: total || 0,
      times: timeMap
    };
  });
};

export const produceDataSource = (productData: ProductType[]) => {
  return productData.map((product) => {
    const timeMap: ProduceTableType['times'] = {};
    const totalQuantity = (product.totalmonthquantities || [])
      .filter((item) => item.status === 1)
      .reduce((acc, item) => acc + item.totalQuan, 0);

    (product.dailyquantities || [])
      .filter((item) => item.status === 1)
      .forEach((time) => {
        const dateKey = dayjs(time.date).format('DD-MM-YYYY');
        // Dùng shift từ BE nếu có, fallback dateTimeToShift cho records cũ (shift = null)
        const shift = time.shift
          ? time.shift === 'Ca 2'
            ? 2
            : 1
          : dateTimeToShift(dateKey, time.created_at);

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
      totalQuantity: totalQuantity,
      times: timeMap
    };
  });
};

export const weeklyDataSource = (
  productData: ProductType[],
  startDate: Dayjs,
  endDate: Dayjs
) => {
  return productData.map((product) => {
    const timeMap: WeekTableType['times'] = {};

    const totalMonthQuantities = product.totalmonthquantities || [];
    const totalDailyQuantities = product.totaldailyquantities || [];

    const totalDailyQuantitiesPO = product.totaldailyquantitiespo || [];

    const prevQuantity100 = totalDailyQuantities
      .filter(
        (item) =>
          item.status === 1 &&
          dayjs(item.date).isAfter(
            dayjs(startDate).startOf('month').subtract(1, 'day')
          ) &&
          dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
      )
      .reduce((acc, item) => acc + item.totalQuan, 0);

    const prevExportQuantity = totalDailyQuantitiesPO
      .filter(
        (item) =>
          item.status === 8 &&
          dayjs(item.date).isAfter(
            dayjs(startDate).startOf('month').subtract(1, 'day')
          ) &&
          dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
      )
      .reduce((acc, item) => acc + item.totalQuan, 0);

    const quantity100 = totalDailyQuantities
      .filter(
        (item) =>
          item.status === 1 &&
          dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
          dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
      )
      .reduce((acc, item) => acc + item.totalQuan, 0);

    const exportQuantity = totalDailyQuantitiesPO
      .filter(
        (item) =>
          item.status === 8 &&
          dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
          dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
      )
      .reduce((acc, item) => acc + item.totalQuan, 0);

    const errorQuantity =
      totalMonthQuantities.find((item) => item.status === 6)?.totalQuan || 0;

    // calculate begin of week
    let beginOfWeek = 0;

    beginOfWeek =
      totalMonthQuantities.find((item) => item.status === 4)?.totalQuan || 0;

    const reamingOfWeek = prevQuantity100 - prevExportQuantity + beginOfWeek;

    beginOfWeek =
      prevQuantity100 -
      quantity100 -
      (prevExportQuantity - exportQuantity) +
      beginOfWeek;

    const totalQuantity = quantity100 + beginOfWeek;
    const totalReamingOfWeek = reamingOfWeek - errorQuantity;

    totalDailyQuantitiesPO
      .filter(
        (item) =>
          item.status === 8 &&
          dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
          dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
      )
      .map((item) => {
        const dateKey = dayjs(item.date).format('DD-MM-YYYY');
        if (!timeMap[dateKey]) {
          timeMap[dateKey] = { exportQuantity: 0 };
        }
        timeMap[dateKey].exportQuantity += item.totalQuan;
      });

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      totalQuantity: totalQuantity || 0,
      totalReamingOfWeek: totalReamingOfWeek || 0,
      exportQuantity: exportQuantity || 0,
      beginOfWeek: beginOfWeek || 0,
      times: timeMap
    };
  });
};
