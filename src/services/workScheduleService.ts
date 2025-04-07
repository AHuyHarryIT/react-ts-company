import apiPrivate from '@/api/axiosInstance';

import {
  EmployeeSchedule,
  EmployeeTrashWCSchedule,
  NewWorkScheduleType,
  WorkScheduleType
} from '@/types/workScheduleType';

type FilterWorkSchedule = {
  name?: string;
  sort?: string;
};

export type FetchWorkScheduleParams = {
  page?: number;
  limit?: number;
  filters?: FilterWorkSchedule;
};

type WorkSchedulesResponse = {
  id: string;
  title: string;
  date: string;
};

type EmployeeScheduleResponse = {
  employee: {
    id: string;
    name: string;
    code: string;
    category_celender_id: string;
  };
  day1: string;
  day2: string;
  day3: string;
  day4: string;
  day5: string;
  day6: string;
  day7: string;
  day8: string;
  day9: string;
  day10: string;
  day11: string;
  day12: string;
  day13: string;
  day14: string;
  day15: string;
  day16: string;
  day17: string;
  day18: string;
  day19: string;
  day20: string;
  day21: string;
  day22: string;
  day23: string;
  day24: string;
  day25: string;
  day26: string;
  day27: string;
  day28: string;
  day29: string;
  day30: string;
  day31: string;
};

type WorkScheduleResponse = {
  schedule: {
    id: string;
    title: string;
    date: string;
  };
  categories: {
    id: string;
    name: string;
  }[];
  scheduleDetailsHNHC: EmployeeScheduleResponse[];
  scheduleDetailsEatRoom: EmployeeScheduleResponse[];
  scheduleDetailsWCCleanWomen: EmployeeScheduleResponse[];
  scheduleDetailsWCCleanMen: EmployeeScheduleResponse[];
  scheduleDetailsWC: {
    employee: {
      id: string;
      name: string;
      code: string;
      category_celender_id: string;
    };
    day1: string;
    day2: string;
    day3: string;
    day4: string;
    day5: string;
  }[];
};

const API_URL = '/api/schedules';

// Fetch all work calendars
export const fetchWorkSchedules = async ({
  page,
  limit,
  filters
}: FetchWorkScheduleParams) => {
  const response: { data: WorkSchedulesResponse[]; total: number } =
    await apiPrivate.get(API_URL, {
      params: {
        page: page,
        limit: limit,
        ...filters
      }
    });

  const workScheduleList: WorkScheduleType[] = response.data.map(
    (workSchedule: WorkSchedulesResponse) => {
      return {
        id: workSchedule.id,
        title: workSchedule.title,
        start_date: workSchedule.date
      };
    }
  );

  const total = response.total;

  return {
    workSchedules: workScheduleList,
    total: total
  };
};

// Fetch a work calendar by ID
export const fetchWorkScheduleById = async (id: string) => {
  const response: WorkScheduleResponse = await apiPrivate.get(
    `${API_URL}/${id}`
  );

  const categories = response.categories;

  const schedule: WorkScheduleType = {
    id: response.schedule.id,
    title: response.schedule.title,
    start_date: response.schedule.date
  };

  const schedule_hnhc: EmployeeSchedule[] = response.scheduleDetailsHNHC.map(
    ({ employee, ...rest }) => {
      const {
        code: employee_id,
        category_celender_id: category_schedule_id,
        name: employee_name
      } = employee;
      return {
        ...rest,
        employee_id,
        category_schedule_id,
        employee_name
      };
    }
  );

  const schedule_eat_room: EmployeeSchedule[] =
    response.scheduleDetailsEatRoom.map(({ employee, ...rest }) => {
      const {
        code: employee_id,
        category_celender_id: category_schedule_id,
        name: employee_name
      } = employee;
      return {
        ...rest,
        employee_id,
        category_schedule_id,
        employee_name
      };
    });

  const schedule_wc: EmployeeTrashWCSchedule[] = response.scheduleDetailsWC.map(
    ({ employee, ...rest }) => {
      const {
        code: employee_id,
        category_celender_id: category_schedule_id,
        name: employee_name
      } = employee;
      return {
        ...rest,
        employee_id,
        category_schedule_id,
        employee_name
      };
    }
  );

  const schedule_wc_women: EmployeeSchedule[] =
    response.scheduleDetailsWCCleanWomen.map(({ employee, ...rest }) => {
      const {
        code: employee_id,
        category_celender_id: category_schedule_id,
        name: employee_name
      } = employee;
      return {
        ...rest,
        employee_id,
        category_schedule_id,
        employee_name
      };
    });

  const schedule_wc_men: EmployeeSchedule[] =
    response.scheduleDetailsWCCleanMen.map(({ employee, ...rest }) => {
      const {
        code: employee_id,
        category_celender_id: category_schedule_id,
        name: employee_name
      } = employee;
      return {
        ...rest,
        employee_id,
        category_schedule_id,
        employee_name
      };
    });

  return {
    response,
    schedule: schedule,
    categories: categories,
    schedule_hnhc: schedule_hnhc,
    schedule_eat_room: schedule_eat_room,
    schedule_wc: schedule_wc,
    schedule_wc_women: schedule_wc_women,
    schedule_wc_men: schedule_wc_men
  };
};

// Add a new work schedule
export const addWorkSchedule = async (newWorkSchedule: NewWorkScheduleType) => {
  const formData = new FormData();
  formData.append('title', newWorkSchedule.title);
  formData.append('date', newWorkSchedule.start_date);
  formData.append('fileImport', newWorkSchedule.fileImport);

  const response = await apiPrivate.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete a work calendar
export const deleteWorkSchedule = async (id: string) => {
  const response = await apiPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};
