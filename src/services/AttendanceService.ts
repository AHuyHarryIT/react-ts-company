import {
  AttendanceCreateType,
  AttendanceType,
  AttendanceUpdateType
} from '@/types/attendanceType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/attendances';

export const attendanceService = new CrudService<
  AttendanceType,
  AttendanceCreateType,
  AttendanceUpdateType
>([ENDPOINT, 'history'].join('/'));
