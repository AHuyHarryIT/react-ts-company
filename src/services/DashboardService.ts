import axiosPrivate from '@/api/axiosInstance';
import {
  DashboardDataType,
  SalaryTableType,
  WorkCalendarTableType,
} from '@/types/dashboardType';
import { handleApiError } from '@utils/handleApiError';

export const fetchDashboardData = async () => {
  try {
    const response = await axiosPrivate.get('/api/dashboard');

    const dashboardData: DashboardDataType = {
      totalEmployee: response.data.totalEmployee || 0,
      totalRole: response.data.totalRole || 0,
      totalSalary: response.data.totalSalary || 0,
      totalCalender: response.data.totalCelender || 0,
      totalProduct: response.data.totalProduct || 0,
      totalHistory: response.data.totalHistory || 0,
      totalPlan: response.data.totalPlan || 0,
      totalRecord: response.data.totalRecord || 0,
      totalCheckEmployee: response.data.totalCheckEmployee || 0,
    };

    const salaryTableData: SalaryTableType[] =
      response.data.salaryManagers || [];

    const workCalendarTableData: WorkCalendarTableType[] =
      response.data.celenders || [];

    return { dashboardData, salaryTableData, workCalendarTableData };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
