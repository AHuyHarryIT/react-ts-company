import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export const getWeeksInMonth = (month: Dayjs) => {
  const currentMonth = month;
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');

  const startWeek = startOfMonth.startOf('isoWeek').week();
  let endWeek = endOfMonth.startOf('isoWeek').week();

  // Handle December edge case where endOfMonth.week() is 1 (next year)
  if (endWeek === 1 && endOfMonth.month() === 11) {
    endWeek = dayjs(endOfMonth).subtract(7, 'day').week() + 1;
  }

  const weeksInMonth = endWeek - startWeek + 1;

  return {
    startOfMonth,
    endOfMonth,
    weeksInMonth
  };
};
