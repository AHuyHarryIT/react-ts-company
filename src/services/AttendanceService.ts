import axiosPrivate from '@/api/axiosInstance';
import {
  AttendanceCreateType,
  AttendanceType,
  AttendanceUpdateType
} from '@/types/attendanceType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { AttendanceResult } from '@/utils/attendanceUtil';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/attendances';
const EMP_ENDPOINT = '/api/employee/attendances';

export interface AttendanceResponse {
  employee_id: string;
  name: string;
  date: string;
  calendar_category_id: string;
  hnhc: 'N' | 'LN' | 'D' | 'TC' | 'X' | null;
  company: string;
  dates: {
    datetime: string;
    date: string;
    time: string;
  }[];
  is_schedule_change?: boolean;
  day_type?: string;
}

export const attendanceService = new CrudService<
  AttendanceType,
  AttendanceCreateType,
  AttendanceUpdateType
>([ENDPOINT, 'history'].join('/'));

export const fetchAttendances = async (params?: QueryParams) => {
  return await axiosPrivate.get<
    AttendanceResponse,
    PaginatedResponse<AttendanceResponse>
  >(ENDPOINT, {
    params
  });
};

export const fetchEmpAttendances = async (params?: QueryParams) => {
  return await axiosPrivate.get<
    AttendanceResponse,
    PaginatedResponse<AttendanceResponse>
  >(EMP_ENDPOINT, {
    params
  });
};

export const fetchEmpAttendancesHistory = async (params?: QueryParams) => {
  return await axiosPrivate.get<
    AttendanceType,
    PaginatedResponse<AttendanceType>
  >([EMP_ENDPOINT, 'history'].join('/'), {
    params
  });
};

export const fetchAttendancesCalculated = async (params?: QueryParams) => {
  return await axiosPrivate.get<
    AttendanceResult,
    PaginatedResponse<AttendanceResult>
  >(ENDPOINT, {
    params: { ...params, include_calculation: 1 }
  });
};

export const fetchEmpAttendancesCalculated = async (params?: QueryParams) => {
  return await axiosPrivate.get<
    AttendanceResult,
    PaginatedResponse<AttendanceResult>
  >(EMP_ENDPOINT, {
    params: { ...params, include_calculation: 1 }
  });
};
