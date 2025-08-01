import axiosPrivate from '@/api/axiosInstance';
import {
  AttendanceCreateType,
  AttendanceType,
  AttendanceUpdateType
} from '@/types/attendanceType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/attendances';

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
