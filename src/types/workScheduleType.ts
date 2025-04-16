export interface WorkScheduleType {
  id: string;
  title: string;
  start_date: string;
}

export interface NewWorkScheduleType {
  title: string;
  start_date: string;
  fileImport: File;
}

export interface EmployeeSchedule {
  employee_id: string;
  employee_name: string;
  category_schedule_id: string;
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
}

export interface EmployeeTrashWCSchedule {
  employee_id: string;
  employee_name: string;
  category_schedule_id: string;
  day1: string;
  day2: string;
  day3: string;
  day4: string;
  day5: string;
}
