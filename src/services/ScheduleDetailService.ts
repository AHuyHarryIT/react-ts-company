import {
  ScheduleDetailCreateType,
  ScheduleDetailType,
  ScheduleDetailUpdateType
} from '@/types/scheduleDetailType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/schedules/detail';

export const scheduleDetailService = new CrudService<
  ScheduleDetailType,
  ScheduleDetailCreateType,
  ScheduleDetailUpdateType
>(ENDPOINT);
