import {
  DailyScheduleCreateType,
  DailyScheduleType,
  DailyScheduleUpdateType
} from '@/types/dailyScheduleType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/daily-schedules';

export const dailyScheduleService = new CrudService<
  DailyScheduleType,
  DailyScheduleCreateType,
  DailyScheduleUpdateType
>(ENDPOINT);
