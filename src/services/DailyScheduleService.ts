import axiosPrivate from '@/api/axiosInstance';
import {
  DailyScheduleCreateType,
  DailyScheduleType,
  DailyScheduleUpdateType
} from '@/types/dailyScheduleType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/daily-schedules';
const EMP_ENDPOINT = '/api/employee/daily-activities';

export const dailyScheduleService = new CrudService<
  DailyScheduleType,
  DailyScheduleCreateType,
  DailyScheduleUpdateType
>(ENDPOINT);

export const empDailyScheduleService = new CrudService<
  DailyScheduleType,
  DailyScheduleCreateType,
  DailyScheduleUpdateType
>(EMP_ENDPOINT);

export const fetchEmpDailyActivities = async (params: QueryParams) => {
  const response = await axiosPrivate.get<
    DailyScheduleType,
    PaginatedResponse<DailyScheduleType>
  >(EMP_ENDPOINT, { params });
  return response;
};
