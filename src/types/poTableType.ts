export type ErrorTableType = {
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

export type ProduceTableType = {
  id: string;
  name: string;
  code: string;
  totalQuantity: number;
  times: {
    [date: string]: {
      shift1: number;
      shift2: number;
    };
  };
};

export type WeekTableType = {
  id: string;
  name: string;
  code: string;
  totalQuantity: number;
  totalReamingOfWeek: number;
  exportQuantity: number;
  checked200RemainingOfWeek: number;
  beginOfWeek: number;
  times: {
    [date: string]: {
      exportQuantity: number;
    };
  };
};
