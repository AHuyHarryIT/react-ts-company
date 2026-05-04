import { ProductType } from '@/types/productType';
import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';

const toNumber = (value: number | string | undefined | null) =>
  Number(value || 0);

const toMonthKey = (month?: string) => {
  if (!month) return undefined;
  const [first, second] = month.split('-');

  return first.length === 4 ? `${second}-${first}` : month;
};

export interface TotalTableResult {
  id: string;
  name: string;
  code: string;
  stockMOQ: number;
  catonQuantity: number;
  moldSize: string;
  CAV: number;
  cycle: number;
  planTime: number;
  realTime: number;
  FAPV: boolean;
  FASV: boolean;
  FAVV: boolean;
  binCode: string;
  quanEntityBin: number;
  stockStartQuantity: number;
  realityQuantity: number;
  exportQuantity: number;
  checked200: number;
  notCheck200: number;
  stockEndQuantity: number;
  storageTime: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
}

export function calculateTotalProduct(
  products: ProductType[],
  monthlyQuantities: TotalMonthQuantityType[],
  currentMonth?: string
): TotalTableResult[] {
  const currentMonthKey = toMonthKey(currentMonth);

  return products.map((product) => {
    const timeMap: TotalTableResult['times'] = {};
    const totalMonthQuantities: TotalMonthQuantityType[] =
      product?.totalmonthquantities || [];

    const realityQuantity = toNumber(
      totalMonthQuantities.find((item) => item.status === 1)?.totalQuan
    );
    const importQuantity = toNumber(
      totalMonthQuantities.find((item) => item.status === 2)?.totalQuan
    );
    const exportQuantity = monthlyQuantities
      .filter(
        (item) =>
          item.product_id === product.id &&
          (!currentMonthKey || item.month === currentMonthKey)
      )
      .reduce((acc, item) => acc + toNumber(item.totalQuan), 0);
    const stockStartQuantity = toNumber(
      totalMonthQuantities.find((item) => item.status === 4)?.totalQuan
    );
    const stockQuantity200 = toNumber(
      totalMonthQuantities.find((item) => item.status === 5)?.totalQuan
    );
    const errorQuantity = toNumber(
      totalMonthQuantities.find((item) => item.status === 6)?.totalQuan
    );
    const stockQuantityMOQ = toNumber(
      totalMonthQuantities.find((item) => item.status === 7)?.totalQuan
    );

    const checked200 = stockQuantity200 + importQuantity - exportQuantity;
    const stockEndQuantity =
      stockStartQuantity + realityQuantity - exportQuantity - errorQuantity;
    const notCheck200 =
      stockStartQuantity +
      realityQuantity -
      exportQuantity -
      checked200 -
      errorQuantity;
    const catonQuantity = product.quanEntityBin
      ? stockQuantityMOQ / product.quanEntityBin
      : 0;
    const planTime =
      product.CAV && product.cycle
        ? ((((stockQuantityMOQ / product.CAV) * product.cycle) / 3600 / 24) *
            100) /
          90
        : 0;
    const realTime =
      product.CAV && product.cycle
        ? ((((exportQuantity / product.CAV) * product.cycle) / 3600 / 24) *
            100) /
          90
        : 0;

    const storageTime =
      stockQuantityMOQ !== 0 ? stockEndQuantity / (stockQuantityMOQ / 24) : 0;

    monthlyQuantities
      .filter((item) => item.product_id === product.id)
      .forEach((item) => {
        if (!timeMap[item.month]) {
          timeMap[item.month] = { quantity: 0 };
        }
        timeMap[item.month].quantity += toNumber(item.totalQuan);
      });

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      moldSize: product.moldSize,
      CAV: product.CAV,
      cycle: product.cycle,
      stockMOQ: stockQuantityMOQ,
      catonQuantity: catonQuantity,
      planTime: planTime,
      realTime: realTime,
      FAPV: product.FAPV,
      FASV: product.FASV,
      FAVV: product.FAVV,
      binCode: product.binCode,
      quanEntityBin: product.quanEntityBin,
      stockStartQuantity: stockStartQuantity,
      realityQuantity: realityQuantity,
      exportQuantity: exportQuantity,
      checked200: checked200,
      notCheck200: notCheck200,
      stockEndQuantity: stockEndQuantity,
      storageTime: storageTime,
      times: timeMap
    };
  });
}
