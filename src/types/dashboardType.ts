export interface DashboardDataType {
  totalEmployee: number;
  totalRole: number;
  totalSalary: number;
  totalCalender: number;
  totalProduct: number;
  totalHistory: number;
  totalPlan: number;
  totalRecord: number;
  totalCheckEmployee: number;
}

export type TableType = {
  id: string;
  title: string;
};

export type SalaryTableType = TableType & {
  total: string;
  start_date: string;
  end_date: string;
};

export type WorkCalendarTableType = TableType & {
  date: string;
};
